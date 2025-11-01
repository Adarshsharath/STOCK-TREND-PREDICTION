import pandas as pd
import numpy as np
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import talib

def create_svm_features(df):
    """Create optimized features for SVM classification"""
    data = df.copy()
    
    # Ensure float64 type for talib (critical!)
    close = data['close'].astype(np.float64).values
    high = data['high'].astype(np.float64).values
    low = data['low'].astype(np.float64).values
    volume = data['volume'].astype(np.float64).values
    open_price = data['open'].astype(np.float64).values
    
    # Price features
    data['HL_pct'] = (data['high'] - data['low']) / data['close'] * 100
    data['OC_pct'] = (data['close'] - data['open']) / data['open'] * 100
    
    # Moving Averages
    data['SMA_5'] = talib.SMA(close, timeperiod=5)
    data['SMA_10'] = talib.SMA(close, timeperiod=10)
    data['SMA_20'] = talib.SMA(close, timeperiod=20)
    data['EMA_12'] = talib.EMA(close, timeperiod=12)
    data['EMA_26'] = talib.EMA(close, timeperiod=26)
    
    # Relative position to MAs
    data['price_to_SMA5'] = (data['close'] / data['SMA_5'] - 1) * 100
    data['price_to_SMA20'] = (data['close'] / data['SMA_20'] - 1) * 100
    
    # MACD
    macd, macdsignal, macdhist = talib.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)
    data['MACD'] = macd
    data['MACD_signal'] = macdsignal
    data['MACD_hist'] = macdhist
    data['MACD_hist_change'] = np.gradient(macdhist)
    
    # RSI
    data['RSI_7'] = talib.RSI(close, timeperiod=7)
    data['RSI_14'] = talib.RSI(close, timeperiod=14)
    data['RSI_change'] = data['RSI_14'] - data['RSI_14'].shift(1)
    
    # Bollinger Bands
    upper, middle, lower = talib.BBANDS(close, timeperiod=20)
    data['BB_upper'] = upper
    data['BB_middle'] = middle
    data['BB_lower'] = lower
    data['BB_width'] = (data['BB_upper'] - data['BB_lower']) / data['BB_middle']
    data['BB_position'] = (data['close'] - data['BB_lower']) / (data['BB_upper'] - data['BB_lower'])
    
    # Stochastic
    slowk, slowd = talib.STOCH(high, low, close)
    data['STOCH_K'] = slowk
    data['STOCH_D'] = slowd
    data['STOCH_diff'] = slowk - slowd
    
    # ADX
    data['ADX'] = talib.ADX(high, low, close, timeperiod=14)
    data['PLUS_DI'] = talib.PLUS_DI(high, low, close, timeperiod=14)
    data['MINUS_DI'] = talib.MINUS_DI(high, low, close, timeperiod=14)
    data['DI_diff'] = data['PLUS_DI'] - data['MINUS_DI']
    
    # CCI
    data['CCI'] = talib.CCI(high, low, close, timeperiod=14)
    
    # Williams %R
    data['WILLR'] = talib.WILLR(high, low, close, timeperiod=14)
    
    # ATR (Volatility)
    data['ATR'] = talib.ATR(high, low, close, timeperiod=14)
    data['ATR_pct'] = data['ATR'] / data['close'] * 100
    
    # Volume indicators
    data['OBV'] = talib.OBV(close, volume)
    data['OBV_change'] = data['OBV'].pct_change()
    data['Volume_ratio'] = data['volume'] / data['volume'].rolling(20).mean()
    
    # Momentum
    data['MOM'] = talib.MOM(close, timeperiod=10)
    data['ROC'] = talib.ROC(close, timeperiod=10)
    
    # Returns
    for i in [1, 2, 3, 5]:
        data[f'return_{i}d'] = data['close'].pct_change(i)
    
    # Volatility
    data['volatility_5'] = data['close'].pct_change().rolling(window=5).std()
    data['volatility_10'] = data['close'].pct_change().rolling(window=10).std()
    
    # Price momentum
    data['momentum_strength'] = data['close'].pct_change() / data['volatility_5']
    
    # Target: Next day direction
    data['target'] = (data['close'].shift(-1) > data['close']).astype(int)
    
    # Drop NaN
    data = data.dropna()
    
    return data

def svm_classifier_predict(df):
    """
    SVM Classifier for Stock Direction Prediction
    
    Args:
        df: DataFrame with stock data (must have OHLCV)
    
    Returns:
        dict with predictions, probabilities, actual values, and metrics
    """
    try:
        # Create features
        data = create_svm_features(df)
        
        # Select features (SVM works best with carefully selected features)
        feature_cols = [
            'HL_pct', 'OC_pct', 'price_to_SMA5', 'price_to_SMA20',
            'MACD', 'MACD_hist', 'MACD_hist_change',
            'RSI_14', 'RSI_change',
            'BB_width', 'BB_position',
            'STOCH_K', 'STOCH_diff',
            'ADX', 'DI_diff',
            'CCI', 'WILLR',
            'ATR_pct',
            'OBV_change', 'Volume_ratio',
            'MOM', 'ROC',
            'return_1d', 'return_2d', 'return_3d',
            'volatility_5', 'momentum_strength'
        ]
        
        # Filter to available features
        feature_cols = [col for col in feature_cols if col in data.columns]
        
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
        
        # Standardize features (critical for SVM)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train SVM Classifier with RBF kernel
        model = SVC(
            C=10.0,
            kernel='rbf',
            gamma='scale',
            class_weight='balanced',
            probability=True,
            random_state=42,
            cache_size=500
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Make predictions
        predictions = model.predict(X_test_scaled)
        probabilities = model.predict_proba(X_test_scaled)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, predictions) * 100
        
        cm = confusion_matrix(y_test, predictions)
        tn, fp, fn, tp = cm.ravel()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        # Support vectors info
        n_support = model.n_support_
        support_vector_ratio = sum(n_support) / len(X_train) * 100
        
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
                'support_vectors': int(sum(n_support)),
                'support_vector_ratio': float(support_vector_ratio),
                'confusion_matrix': cm.tolist()
            },
            'metadata': {
                'name': 'SVM Classifier',
                'description': 'Support Vector Machine excels at finding optimal decision boundaries. Works well on smaller datasets.',
                'type': 'classification',
                'parameters': {
                    'C': 10.0,
                    'kernel': 'rbf',
                    'gamma': 'scale',
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
        raise Exception(f"SVM Classifier prediction error: {str(e)}")
