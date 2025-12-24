"""
Multi-Step LSTM Model for Stock Price Forecasting - OPTIMIZED FOR 60%+ ACCURACY
Predicts 5-7 days ahead with trend classification
Uses BiLSTM architecture with OHLCV features and technical indicators
"""

import numpy as np
import pandas as pd
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    Input, Dense, Dropout, LSTM, Bidirectional, 
    BatchNormalization, Concatenate
)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, confusion_matrix
import warnings
warnings.filterwarnings('ignore')


def create_technical_features(df):
    """
    Create technical indicators and features from OHLCV data
    
    Args:
        df: DataFrame with OHLCV data
        
    Returns:
        DataFrame with additional technical features
    """
    data = df.copy()
    
    # Price-based features
    data['returns'] = data['close'].pct_change()
    data['log_returns'] = np.log(data['close'] / data['close'].shift(1))
    
    # Moving Averages
    data['sma_5'] = data['close'].rolling(window=5).mean()
    data['sma_10'] = data['close'].rolling(window=10).mean()
    data['sma_20'] = data['close'].rolling(window=20).mean()
    data['ema_12'] = data['close'].ewm(span=12, adjust=False).mean()
    data['ema_26'] = data['close'].ewm(span=26, adjust=False).mean()
    
    # MACD
    data['macd'] = data['ema_12'] - data['ema_26']
    data['macd_signal'] = data['macd'].ewm(span=9, adjust=False).mean()
    data['macd_diff'] = data['macd'] - data['macd_signal']
    
    # RSI
    delta = data['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    data['rsi'] = 100 - (100 / (1 + rs))
    
    # Bollinger Bands
    data['bb_middle'] = data['close'].rolling(window=20).mean()
    bb_std = data['close'].rolling(window=20).std()
    data['bb_upper'] = data['bb_middle'] + (bb_std * 2)
    data['bb_lower'] = data['bb_middle'] - (bb_std * 2)
    data['bb_width'] = (data['bb_upper'] - data['bb_lower']) / data['bb_middle']
    
    # ATR (Average True Range) - Volatility
    high_low = data['high'] - data['low']
    high_close = np.abs(data['high'] - data['close'].shift())
    low_close = np.abs(data['low'] - data['close'].shift())
    ranges = pd.concat([high_low, high_close, low_close], axis=1)
    true_range = np.max(ranges, axis=1)
    data['atr'] = true_range.rolling(14).mean()
    
    # Volume features
    data['volume_sma'] = data['volume'].rolling(window=20).mean()
    data['volume_ratio'] = data['volume'] / data['volume_sma']
    
    # Price momentum
    data['momentum_5'] = data['close'] - data['close'].shift(5)
    data['momentum_10'] = data['close'] - data['close'].shift(10)
    
    # Lag features
    data['close_lag_1'] = data['close'].shift(1)
    data['close_lag_3'] = data['close'].shift(3)
    data['close_lag_7'] = data['close'].shift(7)
    
    # Drop NaN values
    data = data.dropna()
    
    return data


def classify_trend(future_prices):
    """
    Classify trend based on future price movement
    
    Args:
        future_prices: Array of future prices
        
    Returns:
        Trend class: 0=Bearish, 1=Sideways, 2=Bullish
    """
    if len(future_prices) == 0:
        return 1  # Sideways as default
    
    start_price = future_prices[0]
    end_price = future_prices[-1]
    pct_change = ((end_price - start_price) / start_price) * 100
    
    if pct_change > 1.0:
        return 2  # Bullish
    elif pct_change < -1.0:
        return 0  # Bearish
    else:
        return 1  # Sideways


def prepare_multistep_data(df, lookback=60, forecast_horizon=7, use_percentage=False):
    """
    Prepare data for multi-step forecasting
    
    Args:
        df: DataFrame with technical features
        lookback: Number of days to look back
        forecast_horizon: Number of days to forecast ahead
        use_percentage: If True, predict percentage changes instead of prices
        
    Returns:
        X, y_price, y_trend, feature_columns, scalers
    """
    # Select features for training
    feature_cols = [
        'open', 'high', 'low', 'close', 'volume',
        'returns', 'sma_5', 'sma_10', 'sma_20',
        'ema_12', 'ema_26', 'macd', 'macd_signal', 'macd_diff',
        'rsi', 'bb_width', 'atr', 'volume_ratio',
        'momentum_5', 'momentum_10'
    ]
    
    # Ensure all features exist
    feature_cols = [col for col in feature_cols if col in df.columns]
    
    # Scale features
    feature_scaler = MinMaxScaler(feature_range=(0, 1))
    price_scaler = MinMaxScaler(feature_range=(0, 1))
    
    # Scale feature data
    scaled_features = feature_scaler.fit_transform(df[feature_cols].values)
    
    # Scale price data separately for inverse transform
    scaled_prices = price_scaler.fit_transform(df[['close']].values)
    
    X, y_price, y_trend = [], [], []
    
    for i in range(lookback, len(scaled_features) - forecast_horizon):
        # Input sequence
        X.append(scaled_features[i-lookback:i])
        
        # Output: future prices
        future_prices_scaled = scaled_prices[i:i+forecast_horizon].flatten()
        
        if use_percentage:
            # Convert to percentage changes
            current_price = df['close'].iloc[i-1]
            future_prices_actual = price_scaler.inverse_transform(
                future_prices_scaled.reshape(-1, 1)
            ).flatten()
            pct_changes = ((future_prices_actual - current_price) / current_price) * 100
            y_price.append(pct_changes)
        else:
            y_price.append(future_prices_scaled)
        
        # Trend classification
        future_prices_actual = price_scaler.inverse_transform(
            future_prices_scaled.reshape(-1, 1)
        ).flatten()
        trend_class = classify_trend(future_prices_actual)
        y_trend.append(trend_class)
    
    X = np.array(X)
    y_price = np.array(y_price)
    y_trend = np.array(y_trend)
    
    # Convert trend to one-hot encoding
    y_trend_onehot = np.zeros((y_trend.shape[0], 3))
    y_trend_onehot[np.arange(y_trend.shape[0]), y_trend] = 1
    
    return X, y_price, y_trend_onehot, feature_cols, feature_scaler, price_scaler


def build_multistep_model(input_shape, forecast_horizon=7):
    """
    Build IMPROVED BiLSTM model for multi-step forecasting with trend classification
    OPTIMIZED FOR 60%+ ACCURACY
    
    Args:
        input_shape: Shape of input (timesteps, features)
        forecast_horizon: Number of days to forecast
        
    Returns:
        Compiled Keras model
    """
    inputs = Input(shape=input_shape)
    
    # IMPROVED: Deeper network with more units
    # First BiLSTM layer - INCREASED to 256 units
    x = Bidirectional(LSTM(256, return_sequences=True))(inputs)
    x = BatchNormalization()(x)
    x = Dropout(0.4)(x)
    
    # Second BiLSTM layer - INCREASED to 128 units
    x = Bidirectional(LSTM(128, return_sequences=True))(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    
    # Third BiLSTM layer - INCREASED to 64 units
    x = Bidirectional(LSTM(64, return_sequences=False))(x)
    x = Dropout(0.3)(x)
    
    # Shared dense layer - INCREASED to 128 units
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.3)(x)
    
    # Additional dense layer for better learning
    x = Dense(64, activation='relu')(x)
    x = Dropout(0.2)(x)
    
    # Price prediction branch
    price_output = Dense(forecast_horizon, name='price')(x)
    
    # Trend classification branch - IMPROVED
    trend_x = Dense(64, activation='relu')(x)
    trend_x = Dropout(0.3)(trend_x)
    trend_output = Dense(3, activation='softmax', name='trend')(trend_x)
    
    # Create model
    model = Model(inputs=inputs, outputs=[price_output, trend_output])
    
    # Compile model with IMPROVED optimizer
    model.compile(
        optimizer=Adam(learning_rate=0.001, clipnorm=1.0),
        loss={
            'price': 'mse',
            'trend': 'categorical_crossentropy'
        },
        loss_weights={
            'price': 1.0,
            'trend': 0.5
        },
        metrics={
            'price': ['mae', 'mse'],
            'trend': 'accuracy'
        }
    )
    
    return model


def lstm_multistep_predict(df, forecast_horizon=7, lookback=60, epochs=100):
    """
    Multi-step LSTM prediction with trend classification
    OPTIMIZED FOR 60%+ ACCURACY
    
    Args:
        df: DataFrame with stock data
        forecast_horizon: Number of days to forecast (default: 7)
        lookback: Number of days to look back (default: 60)
        epochs: Number of training epochs (default: 100)
        
    Returns:
        dict with predictions, trends, metrics, and metadata
    """
    try:
        # Create technical features
        data = create_technical_features(df)
        
        if len(data) < lookback + forecast_horizon + 100:
            raise ValueError(f"Insufficient data. Need at least {lookback + forecast_horizon + 100} rows")
        
        # Prepare data
        X, y_price, y_trend, feature_cols, feature_scaler, price_scaler = prepare_multistep_data(
            data, lookback, forecast_horizon, use_percentage=False
        )
        
        # Split data: 80% train, 10% validation, 10% test
        train_size = int(len(X) * 0.80)
        val_size = int(len(X) * 0.10)
        
        X_train = X[:train_size]
        y_price_train = y_price[:train_size]
        y_trend_train = y_trend[:train_size]
        
        X_val = X[train_size:train_size+val_size]
        y_price_val = y_price[train_size:train_size+val_size]
        y_trend_val = y_trend[train_size:train_size+val_size]
        
        X_test = X[train_size+val_size:]
        y_price_test = y_price[train_size+val_size:]
        y_trend_test = y_trend[train_size+val_size:]
        
        # Build model
        model = build_multistep_model(
            input_shape=(X_train.shape[1], X_train.shape[2]),
            forecast_horizon=forecast_horizon
        )
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                verbose=0
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=7,
                min_lr=0.00001,
                verbose=0
            )
        ]
        
        # Train model
        history = model.fit(
            X_train,
            {'price': y_price_train, 'trend': y_trend_train},
            validation_data=(
                X_val,
                {'price': y_price_val, 'trend': y_trend_val}
            ),
            epochs=epochs,
            batch_size=16,
            callbacks=callbacks,
            verbose=0
        )
        
        # Make predictions on test set
        y_pred_price, y_pred_trend = model.predict(X_test, verbose=0)
        
        # Inverse transform price predictions
        predictions_actual = []
        actuals_actual = []
        
        for i in range(len(y_pred_price)):
            pred_prices = price_scaler.inverse_transform(y_pred_price[i].reshape(-1, 1)).flatten()
            actual_prices = price_scaler.inverse_transform(y_price_test[i].reshape(-1, 1)).flatten()
            predictions_actual.append(pred_prices)
            actuals_actual.append(actual_prices)
        
        predictions_actual = np.array(predictions_actual)
        actuals_actual = np.array(actuals_actual)
        
        # Calculate metrics
        mae = mean_absolute_error(actuals_actual.flatten(), predictions_actual.flatten())
        rmse = np.sqrt(mean_squared_error(actuals_actual.flatten(), predictions_actual.flatten()))
        mape = np.mean(np.abs((actuals_actual - predictions_actual) / actuals_actual)) * 100
        
        # Directional accuracy
        actual_directions = np.diff(actuals_actual, axis=1) > 0
        pred_directions = np.diff(predictions_actual, axis=1) > 0
        directional_accuracy = np.mean(actual_directions == pred_directions) * 100
        
        # Trend classification metrics
        y_trend_pred_classes = np.argmax(y_pred_trend, axis=1)
        y_trend_actual_classes = np.argmax(y_trend_test, axis=1)
        trend_accuracy = np.mean(y_trend_pred_classes == y_trend_actual_classes) * 100
        
        # Confusion matrix
        cm = confusion_matrix(y_trend_actual_classes, y_trend_pred_classes)
        
        # Prepare results
        last_prediction = predictions_actual[-1].tolist()
        last_trend = ['Bearish', 'Sideways', 'Bullish'][y_trend_pred_classes[-1]]
        last_trend_confidence = float(np.max(y_pred_trend[-1]) * 100)
        
        # Get dates
        test_start_idx = len(data) - len(X_test) - forecast_horizon
        test_dates = data['date'].iloc[test_start_idx:].values
        
        # Forecast dates
        last_date = pd.to_datetime(data['date'].iloc[-1])
        forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_horizon)
        
        return {
            'predictions': last_prediction,
            'forecast_dates': [str(d.date()) for d in forecast_dates],
            'trend': {
                'direction': last_trend,
                'confidence': last_trend_confidence,
                'probabilities': {
                    'bearish': float(y_pred_trend[-1][0] * 100),
                    'sideways': float(y_pred_trend[-1][1] * 100),
                    'bullish': float(y_pred_trend[-1][2] * 100)
                }
            },
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'mape': float(mape),
                'directional_accuracy': float(directional_accuracy),
                'trend_accuracy': float(trend_accuracy)
            },
            'test_results': {
                'predictions': predictions_actual[-10:].tolist(),
                'actual': actuals_actual[-10:].tolist(),
                'dates': [str(d) for d in test_dates[-10:]]
            },
            'confusion_matrix': cm.tolist(),
            'metadata': {
                'name': 'Multi-Step LSTM (Optimized)',
                'description': f'Optimized BiLSTM predicting {forecast_horizon} days ahead with trend classification',
                'parameters': {
                    'lookback': lookback,
                    'forecast_horizon': forecast_horizon,
                    'epochs_trained': len(history.history['loss']),
                    'features_used': len(feature_cols),
                    'architecture': 'BiLSTM (256-128-64) with trend classification',
                    'batch_size': 16,
                    'optimizer': 'Adam (lr=0.001, clipnorm=1.0)'
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"Multi-step LSTM prediction error: {str(e)}")
