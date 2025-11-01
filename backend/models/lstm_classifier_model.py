import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score, confusion_matrix
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands, AverageTrueRange

def create_lstm_features(df):
    """Create features for LSTM classification"""
    data = df.copy()
    
    # Technical indicators
    data['SMA_10'] = SMAIndicator(close=data['close'], window=10).sma_indicator()
    data['SMA_20'] = SMAIndicator(close=data['close'], window=20).sma_indicator()
    data['EMA_12'] = EMAIndicator(close=data['close'], window=12).ema_indicator()
    
    # MACD
    macd_indicator = MACD(close=data['close'], window_fast=12, window_slow=26, window_sign=9)
    data['MACD'] = macd_indicator.macd()
    data['MACD_signal'] = macd_indicator.macd_signal()
    
    # RSI
    data['RSI'] = RSIIndicator(close=data['close'], window=14).rsi()
    
    # Bollinger Bands
    bb = BollingerBands(close=data['close'], window=20, window_dev=2)
    data['BB_upper'] = bb.bollinger_hband()
    data['BB_middle'] = bb.bollinger_mavg()
    data['BB_lower'] = bb.bollinger_lband()
    data['BB_width'] = (data['BB_upper'] - data['BB_lower']) / data['BB_middle']
    
    # ATR
    atr = AverageTrueRange(high=data['high'], low=data['low'], close=data['close'], window=14)
    data['ATR'] = atr.average_true_range()
    
    # Volume
    data['Volume_norm'] = data['volume'] / data['volume'].rolling(20).mean()
    
    # Returns
    data['returns'] = data['close'].pct_change()
    data['returns_5'] = data['close'].pct_change(5)
    
    # Volatility
    data['volatility'] = data['returns'].rolling(window=10).std()
    
    # Target: Next day direction
    data['target'] = (data['close'].shift(-1) > data['close']).astype(int)
    
    # Drop NaN
    data = data.dropna()
    
    return data

def create_sequences(X, y, time_steps=10):
    """Create sequences for LSTM"""
    Xs, ys = [], []
    for i in range(len(X) - time_steps):
        Xs.append(X[i:(i + time_steps)])
        ys.append(y[i + time_steps])
    return np.array(Xs), np.array(ys)

def lstm_classifier_predict(df):
    """
    LSTM Classifier for Stock Direction Prediction
    
    Args:
        df: DataFrame with stock data (must have OHLCV)
    
    Returns:
        dict with predictions, probabilities, actual values, and metrics
    """
    try:
        # Suppress TensorFlow warnings
        tf.get_logger().setLevel('ERROR')
        
        # Create features
        data = create_lstm_features(df)
        
        # Select features
        feature_cols = [
            'close', 'volume', 'SMA_10', 'SMA_20', 'EMA_12',
            'MACD', 'MACD_signal', 'RSI', 'BB_width', 'ATR',
            'Volume_norm', 'returns', 'returns_5', 'volatility'
        ]
        
        # Replace inf with NaN and drop rows with NaN
        data = data.replace([np.inf, -np.inf], np.nan)
        data = data.dropna()
        
        X = data[feature_cols].astype(np.float64).values
        y = data['target'].astype(np.int32).values
        dates = data['date'].values
        prices = data['close'].values
        
        # Scale features
        scaler = MinMaxScaler(feature_range=(0, 1))
        X_scaled = scaler.fit_transform(X)
        
        # Create sequences
        time_steps = 10
        X_seq, y_seq = create_sequences(X_scaled, y, time_steps)
        
        # Split data
        train_size = int(len(X_seq) * 0.8)
        X_train = X_seq[:train_size]
        X_test = X_seq[train_size:]
        y_train = y_seq[:train_size]
        y_test = y_seq[train_size:]
        
        # Build LSTM model
        model = Sequential([
            LSTM(128, return_sequences=True, input_shape=(time_steps, len(feature_cols))),
            Dropout(0.3),
            BatchNormalization(),
            
            LSTM(64, return_sequences=True),
            Dropout(0.3),
            BatchNormalization(),
            
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            
            Dense(16, activation='relu'),
            Dropout(0.2),
            
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        # Early stopping
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        )
        
        # Train model
        history = model.fit(
            X_train, y_train,
            epochs=50,
            batch_size=32,
            validation_split=0.2,
            callbacks=[early_stop],
            verbose=0
        )
        
        # Make predictions
        y_pred_prob = model.predict(X_test, verbose=0)
        predictions = (y_pred_prob > 0.5).astype(int).flatten()
        probabilities = y_pred_prob.flatten()
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, predictions) * 100
        
        cm = confusion_matrix(y_test, predictions)
        tn, fp, fn, tp = cm.ravel()
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        # Get corresponding dates and prices for test set
        test_dates = dates[train_size + time_steps:]
        test_prices = prices[train_size + time_steps:]
        
        # Next day prediction
        latest_prediction = predictions[-1]
        latest_probability = probabilities[-1]
        current_price = test_prices[-1]
        
        price_changes = np.diff(test_prices)
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
        
        # Training history
        train_accuracy = float(history.history['accuracy'][-1] * 100)
        val_accuracy = float(history.history['val_accuracy'][-1] * 100)
        
        return {
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'actual': y_test.tolist(),
            'actual_prices': test_prices.tolist(),
            'dates': [str(d) for d in test_dates],
            'metrics': {
                'accuracy': float(accuracy),
                'precision': float(precision * 100),
                'recall': float(recall * 100),
                'f1_score': float(f1_score * 100),
                'train_accuracy': train_accuracy,
                'val_accuracy': val_accuracy,
                'confusion_matrix': cm.tolist()
            },
            'metadata': {
                'name': 'LSTM Classifier',
                'description': 'Deep learning model that learns sequential temporal patterns. Excellent for time-series data with sufficient history.',
                'type': 'classification',
                'parameters': {
                    'time_steps': time_steps,
                    'layers': '128-64-32',
                    'epochs': len(history.history['loss'])
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
        raise Exception(f"LSTM Classifier prediction error: {str(e)}")
