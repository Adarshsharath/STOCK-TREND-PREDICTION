import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error

def arima_predict(df, order=(5, 1, 0)):
    """
    ARIMA Model for Stock Price Prediction
    
    Args:
        df: DataFrame with stock data
        order: ARIMA order (p, d, q)
    
    Returns:
        dict with predictions, actual values, and metrics
    """
    try:
        # Prepare data
        data = df['close'].values
        
        # Split data
        train_size = int(len(data) * 0.8)
        train_data = data[:train_size]
        test_data = data[train_size:]
        
        # Fit ARIMA model
        model = ARIMA(train_data, order=order)
        fitted_model = model.fit()
        
        # Make predictions
        predictions = fitted_model.forecast(steps=len(test_data))
        
        # Calculate metrics
        mae = mean_absolute_error(test_data, predictions)
        rmse = np.sqrt(mean_squared_error(test_data, predictions))
        
        # Calculate directional accuracy
        actual_direction = np.diff(test_data) > 0
        pred_direction = np.diff(predictions) > 0
        directional_accuracy = np.mean(actual_direction == pred_direction) * 100
        
        # Prepare results
        test_dates = df['date'].iloc[train_size:].values
        
        return {
            'predictions': predictions.tolist(),
            'actual': test_data.tolist(),
            'dates': [str(d) for d in test_dates],
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'directional_accuracy': float(directional_accuracy)
            },
            'metadata': {
                'name': 'ARIMA',
                'description': f'AutoRegressive Integrated Moving Average model with order {order}. Captures linear trends and patterns.',
                'parameters': {
                    'order': order
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"ARIMA prediction error: {str(e)}")
