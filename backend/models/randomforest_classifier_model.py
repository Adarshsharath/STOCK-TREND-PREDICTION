import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from ta.trend import SMAIndicator, EMAIndicator, MACD, ADXIndicator
from ta.momentum import RSIIndicator, StochasticOscillator, WilliamsRIndicator
from ta.volatility import BollingerBands, AverageTrueRange
from ta.volume import OnBalanceVolumeIndicator
from ta.others import DailyReturnIndicator

def create_robust_features(df):
    """Create robust technical features for Random Forest"""
    data = df.copy()
    
    # Basic price features
    data['HL_range'] = (data['high'] - data['low']) / data['close'] * 100
    data['OC_change'] = (data['close'] - data['open']) / data['open'] * 100
    
    # Moving averages
    data['SMA_5'] = SMAIndicator(close=data['close'], window=5).sma_indicator()
    data['SMA_10'] = SMAIndicator(close=data['close'], window=10).sma_indicator()
    data['SMA_20'] = SMAIndicator(close=data['close'], window=20).sma_indicator()
    data['SMA_50'] = SMAIndicator(close=data['close'], window=50).sma_indicator()
    data['EMA_12'] = EMAIndicator(close=data['close'], window=12).ema_indicator()
    data['EMA_26'] = EMAIndicator(close=data['close'], window=26).ema_indicator()
    
    # MA crossovers
    data['SMA_5_10_cross'] = (data['SMA_5'] > data['SMA_10']).astype(int)
    data['SMA_10_20_cross'] = (data['SMA_10'] > data['SMA_20']).astype(int)
    data['EMA_12_26_cross'] = (data['EMA_12'] > data['EMA_26']).astype(int)
    
    # MACD
    macd_indicator = MACD(close=data['close'], window_fast=12, window_slow=26, window_sign=9)
    data['MACD'] = macd_indicator.macd()
    data['MACD_signal'] = macd_indicator.macd_signal()
    data['MACD_hist'] = macd_indicator.macd_diff()
    data['MACD_signal_cross'] = (data['MACD'] > data['MACD_signal']).astype(int)
    
    # RSI
    data['RSI_7'] = RSIIndicator(close=data['close'], window=7).rsi()
    data['RSI_14'] = RSIIndicator(close=data['close'], window=14).rsi()
    data['RSI_21'] = RSIIndicator(close=data['close'], window=21).rsi()
    data['RSI_oversold'] = (data['RSI_14'] < 30).astype(int)
    data['RSI_overbought'] = (data['RSI_14'] > 70).astype(int)
    
    # Bollinger Bands
    bb = BollingerBands(close=data['close'], window=20, window_dev=2)
    data['BB_upper'] = bb.bollinger_hband()
    data['BB_middle'] = bb.bollinger_mavg()
    data['BB_lower'] = bb.bollinger_lband()
    data['BB_width'] = bb.bollinger_wband()
    data['BB_position'] = (data['close'] - data['BB_lower']) / (data['BB_upper'] - data['BB_lower'])
    data['BB_squeeze'] = (data['BB_width'] < data['BB_width'].rolling(20).mean()).astype(int)
    
    # Stochastic
    stoch = StochasticOscillator(high=data['high'], low=data['low'], close=data['close'], window=14, smooth_window=3)
    data['STOCH_K'] = stoch.stoch()
    data['STOCH_D'] = stoch.stoch_signal()
    data['STOCH_cross'] = (data['STOCH_K'] > data['STOCH_D']).astype(int)
    
    # ADX for trend strength
    adx_indicator = ADXIndicator(high=data['high'], low=data['low'], close=data['close'], window=14)
    data['ADX'] = adx_indicator.adx()
    data['PLUS_DI'] = adx_indicator.adx_pos()
    data['MINUS_DI'] = adx_indicator.adx_neg()
    data['DI_cross'] = (data['PLUS_DI'] > data['MINUS_DI']).astype(int)
    data['strong_trend'] = (data['ADX'] > 25).astype(int)
    
    # CCI - use manual calculation as ta library uses different approach
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
    data['Volume_spike'] = (data['volume'] > 1.5 * data['Volume_SMA']).astype(int)
    
    # Momentum
    data['MOM_10'] = data['close'].diff(periods=10)
    data['ROC_5'] = ROCIndicator(close=data['close'], window=5).roc()
    data['ROC_10'] = ROCIndicator(close=data['close'], window=10).roc()
    
    # Lagged returns
    for i in range(1, 6):
        data[f'return_lag_{i}'] = data['close'].pct_change(i)
    
    # Rolling statistics
    data['volatility_5'] = data['close'].pct_change().rolling(window=5).std()
    data['volatility_10'] = data['close'].pct_change().rolling(window=10).std()
    data['volatility_20'] = data['close'].pct_change().rolling(window=20).std()
    
    # Price momentum patterns
    data['price_acceleration'] = data['close'].pct_change() - data['close'].pct_change().shift(1)
    
    # Target: Next day direction
    data['target'] = (data['close'].shift(-1) > data['close']).astype(int)
    
    # Drop NaN values
    data = data.dropna()
    
    return data

def randomforest_classifier_predict(df):
    """
    Random Forest Classifier for Stock Direction Prediction
    
    Args:
        df: DataFrame with stock data (must have OHLCV)
    
    Returns:
        dict with predictions, probabilities, actual values, and metrics
    """
    try:
        # Create features
        data = create_robust_features(df)
        
        # Prepare features
        exclude_cols = ['date', 'close', 'open', 'high', 'low', 'volume', 
                       'dividends', 'stock_splits', 'target']
        feature_cols = [col for col in data.columns if col not in exclude_cols]
        
        # Replace inf with NaN and drop rows with NaN
        data = data.replace([np.inf, -np.inf], np.nan)
        data = data.dropna()
        
        # Ensure float64 type
        X = data[feature_cols].astype(np.float64).values
        y = data['target'].astype(np.int32).values
        
        # Split data
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]
        
        # Train Random Forest Classifier
        model = RandomForestClassifier(
            n_estimators=300,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            class_weight='balanced',
            bootstrap=True,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
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
                'name': 'Random Forest Classifier',
                'description': 'Robust ensemble model resistant to noise and overfitting. Excellent with technical indicators.',
                'type': 'classification',
                'parameters': {
                    'n_estimators': 300,
                    'max_depth': 15,
                    'class_weight': 'balanced'
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
        raise Exception(f"Random Forest Classifier prediction error: {str(e)}")
