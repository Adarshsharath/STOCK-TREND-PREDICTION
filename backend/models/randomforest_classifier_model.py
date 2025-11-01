import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import talib

def create_robust_features(df):
    """Create robust technical features for Random Forest"""
    data = df.copy()
    
    # Ensure float64 type for talib (critical!)
    close = data['close'].astype(np.float64).values
    high = data['high'].astype(np.float64).values
    low = data['low'].astype(np.float64).values
    volume = data['volume'].astype(np.float64).values
    open_price = data['open'].astype(np.float64).values
    
    # Basic price features
    data['HL_range'] = (high - low) / close * 100
    data['OC_change'] = (close - open_price) / open_price * 100
    
    # Moving averages
    data['SMA_5'] = talib.SMA(close, timeperiod=5)
    data['SMA_10'] = talib.SMA(close, timeperiod=10)
    data['SMA_20'] = talib.SMA(close, timeperiod=20)
    data['SMA_50'] = talib.SMA(close, timeperiod=50)
    data['EMA_12'] = talib.EMA(close, timeperiod=12)
    data['EMA_26'] = talib.EMA(close, timeperiod=26)
    
    # MA crossovers
    data['SMA_5_10_cross'] = (data['SMA_5'] > data['SMA_10']).astype(int)
    data['SMA_10_20_cross'] = (data['SMA_10'] > data['SMA_20']).astype(int)
    data['EMA_12_26_cross'] = (data['EMA_12'] > data['EMA_26']).astype(int)
    
    # MACD
    macd, macdsignal, macdhist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
    data['MACD'] = macd
    data['MACD_signal'] = macdsignal
    data['MACD_hist'] = macdhist
    data['MACD_signal_cross'] = (macd > macdsignal).astype(int)
    
    # RSI
    data['RSI_7'] = talib.RSI(close, timeperiod=7)
    data['RSI_14'] = talib.RSI(close, timeperiod=14)
    data['RSI_21'] = talib.RSI(close, timeperiod=21)
    data['RSI_oversold'] = (data['RSI_14'] < 30).astype(int)
    data['RSI_overbought'] = (data['RSI_14'] > 70).astype(int)
    
    # Bollinger Bands
    upper, middle, lower = talib.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2)
    data['BB_upper'] = upper
    data['BB_middle'] = middle
    data['BB_lower'] = lower
    data['BB_width'] = (upper - lower) / middle
    data['BB_position'] = (close - lower) / (upper - lower)
    data['BB_squeeze'] = (data['BB_width'] < data['BB_width'].rolling(20).mean()).astype(int)
    
    # Stochastic
    slowk, slowd = talib.STOCH(high, low, close)
    data['STOCH_K'] = slowk
    data['STOCH_D'] = slowd
    data['STOCH_cross'] = (slowk > slowd).astype(int)
    
    # ADX for trend strength
    data['ADX'] = talib.ADX(high, low, close, timeperiod=14)
    data['PLUS_DI'] = talib.PLUS_DI(high, low, close, timeperiod=14)
    data['MINUS_DI'] = talib.MINUS_DI(high, low, close, timeperiod=14)
    data['DI_cross'] = (data['PLUS_DI'] > data['MINUS_DI']).astype(int)
    data['strong_trend'] = (data['ADX'] > 25).astype(int)
    
    # CCI
    data['CCI'] = talib.CCI(high, low, close, timeperiod=14)
    
    # Williams %R
    data['WILLR'] = talib.WILLR(high, low, close, timeperiod=14)
    
    # ATR (Volatility)
    data['ATR'] = talib.ATR(high, low, close, timeperiod=14)
    data['ATR_pct'] = data['ATR'] / close * 100
    
    # Volume indicators
    data['OBV'] = talib.OBV(close, volume)
    data['Volume_SMA'] = talib.SMA(volume, timeperiod=20)
    data['Volume_spike'] = (volume > 1.5 * data['Volume_SMA'].values).astype(int)
    
    # Momentum
    data['MOM_10'] = talib.MOM(close, timeperiod=10)
    data['ROC_5'] = talib.ROC(close, timeperiod=5)
    data['ROC_10'] = talib.ROC(close, timeperiod=10)
    
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
