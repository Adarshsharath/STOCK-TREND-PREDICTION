import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import talib

def create_technical_features(df):
    """Create comprehensive technical indicators for classification"""
    data = df.copy()
    
    # Ensure float64 type for talib (critical!)
    close = data['close'].astype(np.float64).values
    high = data['high'].astype(np.float64).values
    low = data['low'].astype(np.float64).values
    volume = data['volume'].astype(np.float64).values
    
    # Trend Indicators
    data['SMA_5'] = talib.SMA(close, timeperiod=5)
    data['SMA_10'] = talib.SMA(close, timeperiod=10)
    data['SMA_20'] = talib.SMA(close, timeperiod=20)
    data['EMA_12'] = talib.EMA(close, timeperiod=12)
    data['EMA_26'] = talib.EMA(close, timeperiod=26)
    
    # MACD
    macd, macdsignal, macdhist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
    data['MACD'] = macd
    data['MACD_signal'] = macdsignal
    data['MACD_hist'] = macdhist
    
    # RSI
    data['RSI_14'] = talib.RSI(close, timeperiod=14)
    
    # Bollinger Bands
    upper, middle, lower = talib.BBANDS(close, timeperiod=20)
    data['BB_upper'] = upper
    data['BB_middle'] = middle
    data['BB_lower'] = lower
    data['BB_width'] = (upper - lower) / middle
    
    # Stochastic
    slowk, slowd = talib.STOCH(high, low, close)
    data['STOCH_K'] = slowk
    data['STOCH_D'] = slowd
    
    # ADX
    data['ADX'] = talib.ADX(high, low, close, timeperiod=14)
    
    # ATR (Volatility)
    data['ATR'] = talib.ATR(high, low, close, timeperiod=14)
    
    # Volume indicators
    data['OBV'] = talib.OBV(close, volume)
    data['Volume_SMA'] = talib.SMA(volume, timeperiod=20)
    
    # Momentum
    data['MOM'] = talib.MOM(close, timeperiod=10)
    data['ROC'] = talib.ROC(close, timeperiod=10)
    
    # Price patterns
    data['price_change'] = close - np.roll(close, 1)
    data['price_change_pct'] = (close - np.roll(close, 1)) / np.roll(close, 1) * 100
    
    # Lagged features
    for i in range(1, 6):
        data[f'return_lag_{i}'] = data['close'].pct_change(i)
    
    # Rolling statistics
    data['volatility_5'] = data['close'].pct_change().rolling(window=5).std()
    data['volatility_20'] = data['close'].pct_change().rolling(window=20).std()
    
    # Target: Next day direction (1 = up, 0 = down)
    data['target'] = (data['close'].shift(-1) > data['close']).astype(int)
    
    # Drop NaN values
    data = data.dropna()
    
    return data

def logistic_regression_predict(df):
    """
    Logistic Regression Classifier for Stock Direction Prediction
    
    Args:
        df: DataFrame with stock data (must have OHLCV)
    
    Returns:
        dict with predictions, probabilities, actual values, and metrics
    """
    try:
        # Create features
        data = create_technical_features(df)
        
        # Select features
        feature_cols = [
            'SMA_5', 'SMA_10', 'SMA_20', 'EMA_12', 'EMA_26',
            'MACD', 'MACD_signal', 'MACD_hist',
            'RSI_14', 'BB_width', 'STOCH_K', 'STOCH_D',
            'ADX', 'ATR', 'MOM', 'ROC',
            'price_change_pct', 'volatility_5', 'volatility_20',
            'return_lag_1', 'return_lag_2', 'return_lag_3'
        ]
        
        # Filter to available features
        feature_cols = [col for col in feature_cols if col in data.columns]
        
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
        
        # Standardize features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train Logistic Regression model
        model = LogisticRegression(
            C=1.0,
            max_iter=1000,
            class_weight='balanced',
            solver='lbfgs',
            random_state=42
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        predictions = model.predict(X_test_scaled)
        probabilities = model.predict_proba(X_test_scaled)[:, 1]  # Probability of up move
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, predictions) * 100
        
        # Additional metrics
        cm = confusion_matrix(y_test, predictions)
        tn, fp, fn, tp = cm.ravel()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        # Get feature importance
        feature_importance = dict(zip(feature_cols, model.coef_[0]))
        top_features = dict(sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True)[:5])
        
        # Prepare results
        test_dates = data['date'].iloc[train_size:].values
        actual_prices = data['close'].iloc[train_size:].values
        
        # Next day prediction (most recent)
        latest_prediction = predictions[-1]
        latest_probability = probabilities[-1]
        current_price = actual_prices[-1]
        
        # Calculate average price movement from historical data
        price_changes = np.diff(actual_prices)
        avg_up_move = np.mean(price_changes[price_changes > 0]) if len(price_changes[price_changes > 0]) > 0 else current_price * 0.01
        avg_down_move = np.mean(price_changes[price_changes < 0]) if len(price_changes[price_changes < 0]) > 0 else current_price * -0.01
        
        if latest_prediction == 1:  # UP
            direction = 'UP'
            expected_change = avg_up_move
            expected_price = current_price + expected_change
        else:  # DOWN
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
                'name': 'Logistic Regression',
                'description': 'Simple yet interpretable classifier using technical indicators. Shows how each feature affects direction.',
                'type': 'classification',
                'parameters': {
                    'C': 1.0,
                    'solver': 'lbfgs',
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
        raise Exception(f"Logistic Regression prediction error: {str(e)}")
