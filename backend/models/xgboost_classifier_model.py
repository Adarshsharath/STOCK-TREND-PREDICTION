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
        
        # Split data (80-20)
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]
        
        # Calculate scale_pos_weight for imbalanced data
        scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()
        
        # Train XGBoost Classifier
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=7,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            gamma=1,
            min_child_weight=3,
            scale_pos_weight=scale_pos_weight,
            objective='binary:logistic',
            random_state=42,
            n_jobs=-1,
            eval_metric='logloss'
        )
        
        model.fit(X_train, y_train, 
                 eval_set=[(X_test, y_test)],
                 verbose=False)
        
        # Make predictions
        predictions = model.predict(X_test)
        probabilities = model.predict_proba(X_test)[:, 1]
        
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
                'confusion_matrix': cm.tolist()
            },
            'feature_importance': {k: float(v) for k, v in top_features.items()},
            'metadata': {
                'name': 'XGBoost Classifier',
                'description': 'Powerful ensemble model that captures nonlinear relationships between indicators. Excellent for complex patterns.',
                'type': 'classification',
                'parameters': {
                    'n_estimators': 200,
                    'max_depth': 7,
                    'learning_rate': 0.05
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
