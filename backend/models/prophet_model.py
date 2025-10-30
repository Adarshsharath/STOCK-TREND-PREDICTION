import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error

def prophet_predict(df, forecast_days=30):
    """
    Prophet Model for Stock Price Prediction
    
    Args:
        df: DataFrame with stock data
        forecast_days: Number of days to forecast
    
    Returns:
        dict with predictions, actual values, and metrics
    """
    try:
        # Prepare data for Prophet
        prophet_df = pd.DataFrame({
            'ds': pd.to_datetime(df['date']),
            'y': df['close']
        })
        
        # Split data
        train_size = int(len(prophet_df) * 0.8)
        train_df = prophet_df[:train_size]
        test_df = prophet_df[train_size:]
        
        # Create and train model
        model = Prophet(
            daily_seasonality=True,
            yearly_seasonality=True,
            weekly_seasonality=True,
            changepoint_prior_scale=0.05
        )
        
        model.fit(train_df)
        
        # Make predictions
        future = model.make_future_dataframe(periods=len(test_df), freq='D')
        forecast = model.predict(future)
        
        # Extract test predictions
        predictions = forecast['yhat'].iloc[train_size:].values
        actual = test_df['y'].values
        
        # Calculate metrics
        mae = mean_absolute_error(actual, predictions)
        rmse = np.sqrt(mean_squared_error(actual, predictions))
        
        # Calculate directional accuracy
        actual_direction = np.diff(actual) > 0
        pred_direction = np.diff(predictions) > 0
        directional_accuracy = np.mean(actual_direction == pred_direction) * 100
        
        return {
            'predictions': predictions.tolist(),
            'actual': actual.tolist(),
            'dates': [str(d) for d in test_df['ds'].values],
            'metrics': {
                'mae': float(mae),
                'rmse': float(rmse),
                'directional_accuracy': float(directional_accuracy)
            },
            'metadata': {
                'name': 'Prophet',
                'description': 'Facebook Prophet model for time series forecasting. Captures trends, seasonality, and holiday effects.',
                'parameters': {
                    'changepoint_prior_scale': 0.05,
                    'seasonality': 'daily, weekly, yearly'
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"Prophet prediction error: {str(e)}")
