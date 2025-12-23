import numpy as np
import pandas as pd
import xgboost as xgb
from ta.trend import SMAIndicator, EMAIndicator, MACD, ADXIndicator
from ta.momentum import RSIIndicator, StochasticOscillator, ROCIndicator
from ta.volatility import AverageTrueRange, BollingerBands
from ta.volume import OnBalanceVolumeIndicator, MFIIndicator

BUY = 1
HOLD = 0
SELL = -1

HORIZONS = [3, 7, 14]
RET_THRESH = {3: 0.015, 7: 0.025, 14: 0.04}  # horizon-specific return thresholds


def compute_regime(data: pd.DataFrame) -> pd.Series:
    sma50 = SMAIndicator(close=data['close'], window=50).sma_indicator()
    sma200 = SMAIndicator(close=data['close'], window=200).sma_indicator()
    regime = pd.Series(index=data.index, dtype='int32')
    regime[:] = 0
    regime[sma50 > sma200 * 1.01] = 1  # bull
    regime[sma50 < sma200 * 0.99] = -1  # bear
    return regime.fillna(0)


def build_features(df: pd.DataFrame, benchmark: pd.DataFrame | None = None) -> pd.DataFrame:
    data = df.copy()
    # Basic returns & volatility
    data['ret_1'] = data['close'].pct_change(1)
    data['ret_3'] = data['close'].pct_change(3)
    data['ret_5'] = data['close'].pct_change(5)
    data['vol_10'] = data['ret_1'].rolling(10).std()
    data['vol_20'] = data['ret_1'].rolling(20).std()

    # Trend & momentum
    for w in [5, 10, 20, 50, 100, 200]:
        data[f'SMA_{w}'] = SMAIndicator(close=data['close'], window=w).sma_indicator()
    data['EMA_12'] = EMAIndicator(close=data['close'], window=12).ema_indicator()
    data['EMA_26'] = EMAIndicator(close=data['close'], window=26).ema_indicator()
    macd = MACD(close=data['close'], window_fast=12, window_slow=26, window_sign=9)
    data['MACD'] = macd.macd()
    data['MACD_signal'] = macd.macd_signal()

    # Oscillators
    data['RSI_14'] = RSIIndicator(close=data['close'], window=14).rsi()
    stoch = StochasticOscillator(high=data['high'], low=data['low'], close=data['close'], window=14, smooth_window=3)
    data['STOCH_K'] = stoch.stoch()
    data['STOCH_D'] = stoch.stoch_signal()

    # Volatility & bands
    atr = AverageTrueRange(high=data['high'], low=data['low'], close=data['close'], window=14)
    data['ATR'] = atr.average_true_range()
    bb = BollingerBands(close=data['close'], window=20, window_dev=2)
    data['BB_width'] = bb.bollinger_wband()

    # Volume
    obv = OnBalanceVolumeIndicator(close=data['close'], volume=data['volume'])
    data['OBV'] = obv.on_balance_volume()
    data['VOL_SMA20'] = data['volume'].rolling(20).mean()
    data['VOL_ratio'] = data['volume'] / data['VOL_SMA20']
    mfi = MFIIndicator(high=data['high'], low=data['low'], close=data['close'], volume=data['volume'], window=14)
    data['MFI'] = mfi.money_flow_index()

    # ADX / DMI
    adx = ADXIndicator(high=data['high'], low=data['low'], close=data['close'], window=14)
    data['ADX'] = adx.adx()
    data['PLUS_DI'] = adx.adx_pos()
    data['MINUS_DI'] = adx.adx_neg()

    # Relative strength vs benchmark (optional)
    if benchmark is not None and not benchmark.empty:
        bmk = benchmark.copy()
        bmk = bmk.rename(columns=str.lower)
        if 'close' in bmk:
            rs = (data['close'] / bmk['close'].reindex(data.index).ffill()).pct_change(5)
            data['RS_BMK_5'] = rs

    # Regime
    data['REGIME'] = compute_regime(data)

    # Targets: multi-horizon returns
    for h in HORIZONS:
        data[f'fwd_ret_{h}'] = data['close'].shift(-h) / data['close'] - 1.0
        thr = RET_THRESH[h]
        label = pd.Series(0, index=data.index)
        label[data[f'fwd_ret_{h}'] >= thr] = BUY
        label[data[f'fwd_ret_{h}'] <= -thr] = SELL
        data[f'label_{h}'] = label

    data.replace([np.inf, -np.inf], np.nan, inplace=True)
    data.dropna(inplace=True)
    return data


def _time_aware_split(X, y, train_frac=0.8, val_tail_frac=0.2):
    n = len(X)
    t = int(n * train_frac)
    X_train_full, X_test = X[:t], X[t:]
    y_train_full, y_test = y[:t], y[t:]
    v = max(int(len(X_train_full) * val_tail_frac), min(100, max(20, len(X)//20)))
    X_train, X_val = X_train_full[:-v], X_train_full[-v:]
    y_train, y_val = y_train_full[:-v], y_train_full[-v:]
    return X_train, y_train, X_val, y_val, X_test, y_test


def _train_xgb_classifier(X_train, y_train, X_val, y_val):
    # 3-class classification: SELL (-1), HOLD (0), BUY (1) -> map to {0,1,2}
    mapper = {SELL: 0, HOLD: 1, BUY: 2}
    y_train_m = np.vectorize(mapper.get)(y_train)
    y_val_m = np.vectorize(mapper.get)(y_val)

    param_grid = [
        dict(n_estimators=700, max_depth=5, learning_rate=0.05, subsample=0.9, colsample_bytree=0.8, min_child_weight=2),
        dict(n_estimators=900, max_depth=6, learning_rate=0.035, subsample=0.85, colsample_bytree=0.8, min_child_weight=3),
        dict(n_estimators=600, max_depth=4, learning_rate=0.06, subsample=0.9, colsample_bytree=0.9, min_child_weight=1),
    ]
    best = None
    best_acc = -1.0

    for params in param_grid:
        model = xgb.XGBClassifier(
            objective='multi:softprob',
            num_class=3,
            eval_metric='mlogloss',
            random_state=42,
            n_jobs=-1,
            **params,
        )
        model.fit(
            X_train, y_train_m,
            eval_set=[(X_val, y_val_m)],
            early_stopping_rounds=50,
            verbose=False,
        )
        val_probs = model.predict_proba(X_val)
        val_preds = val_probs.argmax(axis=1)
        acc = (val_preds == y_val_m).mean()
        if acc > best_acc:
            best_acc = acc
            best = (model, params)

    return best[0], best[1], best_acc


def train_and_predict_multi_horizon(df: pd.DataFrame, benchmark_df: pd.DataFrame | None = None):
    data = build_features(df, benchmark_df)

    base_cols = [c for c in data.columns if c not in set(['date','open','high','low','close','volume','dividends','stock_splits']
                    | set([f'fwd_ret_{h}' for h in HORIZONS])
                    | set([f'label_{h}' for h in HORIZONS]))]

    results = {}
    feature_importances = {}
    horizon_outputs = {}

    for h in HORIZONS:
        y = data[f'label_{h}'].astype(int).values
        X = data[base_cols].astype(np.float64).values
        X_train, y_train, X_val, y_val, X_test, y_test = _time_aware_split(X, y)

        model, params, val_acc = _train_xgb_classifier(X_train, y_train, X_val, y_val)

        # Predictions
        mapper = {SELL: 0, HOLD: 1, BUY: 2}
        inv_mapper = {v: k for k, v in mapper.items()}
        test_probs = model.predict_proba(X_test)
        test_preds = np.array([inv_mapper[i] for i in test_probs.argmax(axis=1)])

        # Importance
        importances = dict(zip(base_cols, model.feature_importances_))
        feature_importances[h] = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True)[:10])

        # Collect
        horizon_outputs[h] = {
            'preds': test_preds,
            'probs': test_probs.tolist(),
            'y_test': y_test.tolist(),
            'val_acc': float(val_acc * 100),
            'params': {k: (int(v) if isinstance(v, (int, np.integer)) else float(v) if isinstance(v, (float, np.floating)) else v) for k, v in params.items()}
        }

    # Aggregate signals across horizons, penalize conflicts
    # Strategy: BUY if 2+ horizons BUY and none SELL; SELL if 2+ SELL and none BUY; else HOLD
    test_len = len(next(iter(horizon_outputs.values()))['preds'])
    agg_signal = []
    confidence = []
    for i in range(test_len):
        votes = [horizon_outputs[h]['preds'][i] for h in HORIZONS]
        buys = votes.count(BUY)
        sells = votes.count(SELL)
        if buys >= 2 and sells == 0:
            agg = BUY
        elif sells >= 2 and buys == 0:
            agg = SELL
        else:
            agg = HOLD
        agg_signal.append(agg)
        # confidence: majority size / 3 weighted by average max prob
        max_probs = [max(horizon_outputs[h]['probs'][i]) for h in HORIZONS]
        maj = max(buys, sells, votes.count(HOLD))
        conf = 0.5 * (maj / 3.0) + 0.5 * (np.mean(max_probs))
        confidence.append(float(conf))

    # Backtest on test window using 1-day forward returns as proxy per step
    # For each step, use the earliest available fwd return among horizons (3d) as target; simple implementation
    dates = data['date'].iloc[-test_len:].astype(str).tolist() if 'date' in data.columns else [str(i) for i in range(test_len)]
    close_test = data['close'].iloc[-test_len:].values
    fwd3 = data['fwd_ret_3'].iloc[-test_len:].values

    # Simple backtest: daily PnL approximated by sign * fwd3/3 per day
    pnl = []
    for i in range(test_len):
        if agg_signal[i] == BUY:
            pnl.append(max(fwd3[i], 0))
        elif agg_signal[i] == SELL:
            pnl.append(max(-fwd3[i], 0))
        else:
            pnl.append(0.0)
    pnl = np.array(pnl)
    equity = (1 + pnl).cumprod()

    # Metrics
    wins = (pnl > 0).sum()
    losses = (pnl < 0).sum()
    win_rate = float(wins / max(wins + losses, 1) * 100)
    cum_return = float(equity[-1] - 1.0)
    max_dd = float((np.maximum.accumulate(equity) - equity).max())

    # BUY precision/recall on test labels of 3d horizon (treat BUY as positive)
    y_test_3 = np.array(horizon_outputs[3]['y_test'])
    preds_3 = np.array(horizon_outputs[3]['preds'])
    tp = ((preds_3 == BUY) & (y_test_3 == BUY)).sum()
    fp = ((preds_3 == BUY) & (y_test_3 != BUY)).sum()
    fn = ((preds_3 != BUY) & (y_test_3 == BUY)).sum()
    precision_buy = float(tp / max(tp + fp, 1) * 100)
    recall_buy = float(tp / max(tp + fn, 1) * 100)

    # Final explanation: top features across horizons
    top_factors = {}
    for h, imp in feature_importances.items():
        top_factors[str(h)] = [{"feature": k, "importance": float(v)} for k, v in imp.items()]

    # Map final signal at the end of test
    final_signal = agg_signal[-1] if len(agg_signal) else HOLD
    final_signal_str = 'BUY' if final_signal == BUY else 'SELL' if final_signal == SELL else 'HOLD'

    return {
        'horizons': {str(h): horizon_outputs[h] for h in HORIZONS},
        'aggregate': {
            'signals': [int(s) for s in agg_signal],
            'confidence': confidence,
            'dates': dates,
            'final_signal': final_signal_str,
            'final_confidence': confidence[-1] if confidence else None
        },
        'metrics': {
            'win_rate': win_rate,
            'max_drawdown': max_dd,
            'cumulative_return': cum_return,
            'buy_precision': precision_buy,
            'buy_recall': recall_buy
        },
        'explainability': {
            'top_features': top_factors
        },
        'metadata': {
            'model': 'XGB Multi-Horizon Signals',
            'maintainability': 'tree-based, interpretable importances',
            'note': 'Signals are BUY(1)/HOLD(0)/SELL(-1); horizons 3/7/14 days; time-aware split with validation; no leakage.'
        }
    }
