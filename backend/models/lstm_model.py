import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error

def create_sequences(data, seq_length=60):
    """Create sequences for LSTM"""
    X, y = [], []
    for i in range(seq_length, len(data)):
        X.append(data[i-seq_length:i, 0])
        y.append(data[i, 0])
    return np.array(X), np.array(y)

def lstm_predict(df, forecast_days=30):
    """
    LSTM Model for Stock Price Prediction
    
    Args:
        df: DataFrame with stock data
        forecast_days: Number of days to forecast
    
    Returns:
        dict with predictions, actual values, and metrics
    """
    try:
        # Prepare data
        data = df[['close']].values
        
        # Scale data
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)
        
        # Split data
        train_size = int(len(scaled_data) * 0.8)
        train_data = scaled_data[:train_size]
        test_data = scaled_data[train_size - 60:]
        
        # Create sequences
        seq_length = 60
        X_train, y_train = create_sequences(train_data, seq_length)
        X_test, y_test = create_sequences(test_data, seq_length)
        
        # Reshape for LSTM
        X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))
        X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
        
        # Build LSTM model
        model = Sequential([
            LSTM(units=50, return_sequences=True, input_shape=(X_train.shape[1], 1)),
            Dropout(0.2),
            LSTM(units=50, return_sequences=False),
            Dropout(0.2),
            Dense(units=25),
            Dense(units=1)
        ])
        
        model.compile(optimizer='adam', loss='mean_squared_error')
        
        # Train model
        model.fit(X_train, y_train, batch_size=32, epochs=10, verbose=0)
        
        # Make predictions
        predictions = model.predict(X_test, verbose=0)
        predictions = scaler.inverse_transform(predictions)
        y_test_actual = scaler.inverse_transform(y_test.reshape(-1, 1))
        
        # Calculate metrics
        mae = mean_absolute_error(y_test_actual, predictions)
        rmse = np.sqrt(mean_squared_error(y_test_actual, predictions))
        
        # Calculate directional accuracy
        actual_direction = np.diff(y_test_actual.flatten()) > 0
        pred_direction = np.diff(predictions.flatten()) > 0
        directional_accuracy = np.mean(actual_direction == pred_direction) * 100
        
        # Prepare results
        test_dates = df['date'].iloc[train_size:].values
        
        return {
            'predictions': predictions.flatten().tolist(),
            'actual': y_test_actual.flatten().tolist(),
            'dates': [str(d) for d in test_dates[-len(predictions):]],
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'directional_accuracy': float(directional_accuracy)
            },
            'metadata': {
                'name': 'LSTM',
                'description': 'Long Short-Term Memory neural network for time series prediction. Uses 60-day sequences to predict future prices.',
                'parameters': {
                    'sequence_length': seq_length,
                    'epochs': 10,
                    'batch_size': 32
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"LSTM prediction error: {str(e)}")
