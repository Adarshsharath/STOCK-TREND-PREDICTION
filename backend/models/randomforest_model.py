import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

def create_features(df, lookback=5):
    """Create lagged features for Random Forest"""
    data = df.copy()
    
    # Create lagged features
    for i in range(1, lookback + 1):
        data[f'close_lag_{i}'] = data['close'].shift(i)
    
    # Create rolling features
    data['rolling_mean_5'] = data['close'].rolling(window=5).mean()
    data['rolling_std_5'] = data['close'].rolling(window=5).std()
    data['rolling_mean_10'] = data['close'].rolling(window=10).mean()
    
    # Drop NaN values
    data = data.dropna()
    
    return data

def randomforest_predict(df, lookback=5):
    """
    Random Forest Model for Stock Price Prediction
    
    Args:
        df: DataFrame with stock data
        lookback: Number of lagged features
    
    Returns:
        dict with predictions, actual values, and metrics
    """
    try:
        # Create features
        data = create_features(df, lookback)
        
        # Prepare features and target
        feature_cols = [col for col in data.columns if col not in ['date', 'close', 'open', 'high', 'low', 'volume', 'dividends', 'stock_splits']]
        X = data[feature_cols].values
        y = data['close'].values
        
        # Split data
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]
        
        # Train Random Forest model
        model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_train, y_train)
        
        # Make predictions
        predictions = model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, predictions)
        rmse = np.sqrt(mean_squared_error(y_test, predictions))
        
        # Calculate directional accuracy
        actual_direction = np.diff(y_test) > 0
        pred_direction = np.diff(predictions) > 0
        directional_accuracy = np.mean(actual_direction == pred_direction) * 100
        
        # Prepare results
        test_dates = data['date'].iloc[train_size:].values
        
        return {
            'predictions': predictions.tolist(),
            'actual': y_test.tolist(),
            'dates': [str(d) for d in test_dates],
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'directional_accuracy': float(directional_accuracy)
            },
            'metadata': {
                'name': 'Random Forest',
                'description': f'Random Forest ensemble model using {lookback} lagged features and rolling statistics. Captures non-linear patterns.',
                'parameters': {
                    'n_estimators': 100,
                    'max_depth': 10,
                    'lookback': lookback
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"Random Forest prediction error: {str(e)}")
