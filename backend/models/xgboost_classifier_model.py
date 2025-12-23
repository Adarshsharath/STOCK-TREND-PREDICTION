import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from ta.trend import SMAIndicator, EMAIndicator, MACD, ADXIndicator
from ta.momentum import RSIIndicator, StochasticOscillator, WilliamsRIndicator, ROCIndicator
from ta.volatility import BollingerBands, AverageTrueRange
from ta.volume import OnBalanceVolumeIndicator

def create_advanced_features(df):
    """Create comprehensive features for XGBoost"""
    data = df.copy()
    
    # Price-based features
    data['HL_pct'] = (data['high'] - data['low']) / data['close'] * 100
    data['OC_pct'] = (data['close'] - data['open']) / data['open'] * 100
    
    # Trend Indicators
    data['SMA_5'] = SMAIndicator(close=data['close'], window=5).sma_indicator()
    data['SMA_10'] = SMAIndicator(close=data['close'], window=10).sma_indicator()
    data['SMA_20'] = SMAIndicator(close=data['close'], window=20).sma_indicator()
    data['SMA_50'] = SMAIndicator(close=data['close'], window=50).sma_indicator()
    data['EMA_12'] = EMAIndicator(close=data['close'], window=12).ema_indicator()
    data['EMA_26'] = EMAIndicator(close=data['close'], window=26).ema_indicator()
    
    # Price relative to SMAs
    data['price_to_SMA5'] = (data['close'] / data['SMA_5'] - 1) * 100
    data['price_to_SMA20'] = (data['close'] / data['SMA_20'] - 1) * 100
    
    # MACD
    macd_indicator = MACD(close=data['close'], window_fast=12, window_slow=26, window_sign=9)
    data['MACD'] = macd_indicator.macd()
    data['MACD_signal'] = macd_indicator.macd_signal()
    data['MACD_hist'] = macd_indicator.macd_diff()
    
    # RSI
    data['RSI_7'] = RSIIndicator(close=data['close'], window=7).rsi()
    data['RSI_14'] = RSIIndicator(close=data['close'], window=14).rsi()
    data['RSI_21'] = RSIIndicator(close=data['close'], window=21).rsi()
    
    # Bollinger Bands
    bb = BollingerBands(close=data['close'], window=20, window_dev=2)
    data['BB_upper'] = bb.bollinger_hband()
    data['BB_middle'] = bb.bollinger_mavg()
    data['BB_lower'] = bb.bollinger_lband()
    data['BB_width'] = bb.bollinger_wband()
    data['BB_position'] = (data['close'] - data['BB_lower']) / (data['BB_upper'] - data['BB_lower'])
    
    # Stochastic
    stoch = StochasticOscillator(high=data['high'], low=data['low'], close=data['close'], window=14, smooth_window=3)
    data['STOCH_K'] = stoch.stoch()
    data['STOCH_D'] = stoch.stoch_signal()
    
    # ADX and DMI
    adx_indicator = ADXIndicator(high=data['high'], low=data['low'], close=data['close'], window=14)
    data['ADX'] = adx_indicator.adx()
    data['PLUS_DI'] = adx_indicator.adx_pos()
    data['MINUS_DI'] = adx_indicator.adx_neg()
    
    # CCI - manual calculation
    typical_price = (data['high'] + data['low'] + data['close']) / 3
    data['CCI'] = (typical_price - typical_price.rolling(14).mean()) / (0.015 * typical_price.rolling(14).std())
    
    # Williams %R
    willr = WilliamsRIndicator(high=data['high'], low=data['low'], close=data['close'], lbp=14)
    data['WILLR'] = willr.williams_r()
    
    # ATR (Volatility)
    atr = AverageTrueRange(high=data['high'], low=data['low'], close=data['close'], window=14)
    data['ATR'] = atr.average_true_range()
    data['ATR_pct'] = data['ATR'] / data['close'] * 100
    
    # Volume indicators
    obv = OnBalanceVolumeIndicator(close=data['close'], volume=data['volume'])
    data['OBV'] = obv.on_balance_volume()
    data['Volume_SMA'] = SMAIndicator(close=data['volume'], window=20).sma_indicator()
    data['Volume_ratio'] = data['volume'] / data['Volume_SMA']
    
    # Momentum
    data['MOM'] = data['close'].diff(periods=10)
    data['ROC'] = ROCIndicator(close=data['close'], window=10).roc()
    data['ROC_5'] = ROCIndicator(close=data['close'], window=5).roc()
    
    # Lagged returns
    for i in range(1, 8):
        data[f'return_lag_{i}'] = data['close'].pct_change(i)
    
    # Rolling statistics
    data['volatility_5'] = data['close'].pct_change().rolling(window=5).std()
    data['volatility_10'] = data['close'].pct_change().rolling(window=10).std()
    data['volatility_20'] = data['close'].pct_change().rolling(window=20).std()
    
    data['volume_std_20'] = data['volume'].rolling(window=20).std()
    
    # Price patterns
    data['higher_high'] = ((data['high'] > data['high'].shift(1)) & (data['high'].shift(1) > data['high'].shift(2))).astype(int)
    data['lower_low'] = ((data['low'] < data['low'].shift(1)) & (data['low'].shift(1) < data['low'].shift(2))).astype(int)
    
    # Target: Next day direction (1 = up, 0 = down)
    data['target'] = (data['close'].shift(-1) > data['close']).astype(int)
    
    # Drop NaN values
    data = data.dropna()
    
    return data

def xgboost_classifier_predict(df):
    """
    XGBoost Classifier for Stock Direction Prediction
    
    Args:
        df: DataFrame with stock data (must have OHLCV)
    
    Returns:
        dict with predictions, probabilities, actual values, and metrics
    """
    try:
        # Create features
        data = create_advanced_features(df)
        
        # Prepare features and target
        exclude_cols = ['date', 'close', 'open', 'high', 'low', 'volume', 
                       'dividends', 'stock_splits', 'target']
        feature_cols = [col for col in data.columns if col not in exclude_cols]
        
        # Replace inf with NaN and drop rows with NaN
        data = data.replace([np.inf, -np.inf], np.nan)
        data = data.dropna()
        
        # Ensure float64 type
        X = data[feature_cols].astype(np.float64).values
        y = data['target'].astype(np.int32).values
        
        # Chronological split (80-20)
        train_size = int(len(X) * 0.8)
        X_train_full, X_test = X[:train_size], X[train_size:]
        y_train_full, y_test = y[:train_size], y[train_size:]

        # Create validation from the tail of training (time-aware)
        val_size = max(int(len(X_train_full) * 0.2), 50) if len(X_train_full) > 200 else max(int(len(X_train_full) * 0.2), 20)
        X_train, X_val = X_train_full[:-val_size], X_train_full[-val_size:]
        y_train, y_val = y_train_full[:-val_size], y_train_full[-val_size:]
        
        # Calculate scale_pos_weight for imbalanced data
        pos = max((y_train == 1).sum(), 1)
        neg = max((y_train == 0).sum(), 1)
        scale_pos_weight = neg / pos

        # Lightweight hyperparameter sweep with early stopping
        param_options = [
            dict(n_estimators=600, max_depth=5, learning_rate=0.05, subsample=0.9, colsample_bytree=0.8, min_child_weight=2, gamma=0),
            dict(n_estimators=800, max_depth=6, learning_rate=0.035, subsample=0.85, colsample_bytree=0.8, min_child_weight=3, gamma=0),
            dict(n_estimators=500, max_depth=4, learning_rate=0.06, subsample=0.9, colsample_bytree=0.9, min_child_weight=1, gamma=0),
        ]

        best_model = None
        best_val_acc = -1.0
        best_params = None

        for params in param_options:
            model = xgb.XGBClassifier(
                objective='binary:logistic',
                random_state=42,
                n_jobs=-1,
                eval_metric='logloss',
                scale_pos_weight=scale_pos_weight,
                **params,
            )
            model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                early_stopping_rounds=50,
                verbose=False,
            )
            # Evaluate on validation (temporary threshold 0.5)
            val_probs_tmp = model.predict_proba(X_val)[:, 1]
            val_preds_tmp = (val_probs_tmp >= 0.5).astype(int)
            val_acc = (val_preds_tmp == y_val).mean()
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                best_model = model
                best_params = params

        model = best_model
        
        # Tune threshold on validation to maximize accuracy
        val_probs = model.predict_proba(X_val)[:, 1]
        best_thr = 0.5
        best_thr_acc = -1.0
        for thr in np.linspace(0.35, 0.65, 31):
            preds = (val_probs >= thr).astype(int)
            acc = (preds == y_val).mean()
            if acc > best_thr_acc:
                best_thr_acc = acc
                best_thr = thr

        # Predict on test using tuned threshold
        probabilities = model.predict_proba(X_test)[:, 1]
        predictions = (probabilities >= best_thr).astype(int)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, predictions) * 100
        
        cm = confusion_matrix(y_test, predictions)
        tn, fp, fn, tp = cm.ravel()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        # Feature importance
        feature_importance = dict(zip(feature_cols, model.feature_importances_))
        top_features = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:10])
        
        # Prepare results
        test_dates = data['date'].iloc[train_size:].values
        actual_prices = data['close'].iloc[train_size:].values
        
        # Next day prediction
        latest_prediction = predictions[-1]
        latest_probability = probabilities[-1]
        current_price = actual_prices[-1]
        
        price_changes = np.diff(actual_prices)
        avg_up_move = np.mean(price_changes[price_changes > 0]) if len(price_changes[price_changes > 0]) > 0 else current_price * 0.01
        avg_down_move = np.mean(price_changes[price_changes < 0]) if len(price_changes[price_changes < 0]) > 0 else current_price * -0.01
        
        if latest_prediction == 1:
            direction = 'UP'
            expected_change = avg_up_move
            expected_price = current_price + expected_change
        else:
            direction = 'DOWN'
            expected_change = avg_down_move
            expected_price = current_price + expected_change
        
        change_percentage = (expected_change / current_price) * 100
        
        return {
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'actual': y_test.tolist(),
            'actual_prices': actual_prices.tolist(),
            'dates': [str(d) for d in test_dates],
            'metrics': {
                'accuracy': float(accuracy),
                'precision': float(precision * 100),
                'recall': float(recall * 100),
                'f1_score': float(f1_score * 100),
                'confusion_matrix': cm.tolist(),
                'validation_accuracy': float(best_val_acc * 100),
                'threshold': float(best_thr)
            },
            'feature_importance': {k: float(v) for k, v in top_features.items()},
            'metadata': {
                'name': 'XGBoost Classifier',
                'description': 'Powerful ensemble model that captures nonlinear relationships between indicators. Excellent for complex patterns.',
                'type': 'classification',
                'parameters': {
                    **{k: (int(v) if isinstance(v, (int, np.integer)) else float(v) if isinstance(v, (float, np.floating)) else v) for k, v in (best_params or {}).items()},
                    'scale_pos_weight': float(scale_pos_weight)
                }
            },
            'next_day_prediction': {
                'direction': direction,
                'current_price': float(current_price),
                'expected_price': float(expected_price),
                'expected_change': float(expected_change),
                'change_percentage': float(change_percentage),
                'confidence': float(latest_probability * 100) if latest_prediction == 1 else float((1 - latest_probability) * 100)
            }
        }
    
    except Exception as e:
        raise Exception(f"XGBoost Classifier prediction error: {str(e)}")
