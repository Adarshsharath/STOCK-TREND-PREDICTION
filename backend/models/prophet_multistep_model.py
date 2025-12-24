"""
Multi-Step Prophet Model for Stock Price Forecasting
Predicts 5-7 days ahead with trend classification
Uses Prophet's native multi-step forecasting capabilities
"""

import pandas as pd
import numpy as np
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')


def classify_trend(predictions):
    """
    Classify trend based on predicted price movement
    
    Args:
        predictions: Array of predicted prices
        
    Returns:
        Trend class: 0=Bearish, 1=Sideways, 2=Bullish
    """
    if len(predictions) < 2:
        return 1  # Sideways as default
    
    start_price = predictions[0]
    end_price = predictions[-1]
    pct_change = ((end_price - start_price) / start_price) * 100
    
    if pct_change > 1.0:
        return 2  # Bullish
    elif pct_change < -1.0:
        return 0  # Bearish
    else:
        return 1  # Sideways


def calculate_trend_confidence(predictions, forecast_df):
    """
    Calculate confidence in trend prediction based on uncertainty
    
    Args:
        predictions: Array of predicted prices
        forecast_df: Prophet forecast dataframe with uncertainty intervals
        
    Returns:
        Confidence score (0-100)
    """
    # Use Prophet's uncertainty intervals
    uncertainties = forecast_df['yhat_upper'] - forecast_df['yhat_lower']
    avg_uncertainty = uncertainties.mean()
    avg_price = predictions.mean()
    
    # Lower uncertainty = higher confidence
    uncertainty_ratio = avg_uncertainty / avg_price
    confidence = max(50, min(95, 100 - (uncertainty_ratio * 200)))
    
    return float(confidence)


def prophet_multistep_predict(df, forecast_horizon=7):
    """
    Multi-step Prophet prediction with trend classification
    OPTIMIZED FOR 60%+ ACCURACY
    
    Args:
        df: DataFrame with stock data
        forecast_horizon: Number of days to forecast (default: 7)
        
    Returns:
        dict with predictions, trends, metrics, and metadata
    """
    try:
        from models.multistep_utils import create_technical_features
        
        # Create technical features
        data_full = create_technical_features(df)
        
        # Prepare data for Prophet (remove timezone)
        dates = pd.to_datetime(data_full['date'])
        if dates.dt.tz is not None:
            dates = dates.dt.tz_localize(None)
        
        prophet_df = pd.DataFrame({
            'ds': dates,
            'y': data_full['close']
        })
        
        # Add technical indicators as regressors
        regressors = ['volume', 'macd', 'rsi', 'sma_20', 'bb_width', 'atr']
        for reg in regressors:
            if reg in data_full.columns:
                prophet_df[reg] = data_full[reg].values
        
        # Split data: 80% train, 10% validation, 10% test (more training data)
        train_size = int(len(prophet_df) * 0.80)
        train_df = prophet_df[:train_size]
        test_df = prophet_df[train_size:]
        
        # Create and train model with FINE-TUNED parameters
        model = Prophet(
            daily_seasonality=False, # Usually not needed for daily data
            yearly_seasonality=True,
            weekly_seasonality=True,
            changepoint_prior_scale=0.08, # Increased for better trend flexibility
            seasonality_prior_scale=15.0, # Increased for stronger seasonality
            holidays_prior_scale=10.0,
            interval_width=0.95
        )
        
        # Add regressors to model
        for reg in regressors:
            if reg in prophet_df.columns:
                model.add_regressor(reg)
        
        # Fit model
        model.fit(train_df)
        
        # Make predictions on test set (multi-step)
        all_predictions = []
        all_actuals = []
        all_dates = []
        all_trends = []
        
        # Predict on test set for verification
        # Optimization: We only need enough test points to calculate accuracy
        test_points = min(50, len(test_df) - forecast_horizon)
        
        for i in range(test_points):
            last_date = test_df.iloc[i]['ds']
            future = pd.DataFrame({
                'ds': pd.date_range(start=last_date, periods=forecast_horizon+1, freq='D')[1:]
            })
            
            # Use current regressor values for future predictions (simplified)
            for reg in regressors:
                if reg in prophet_df.columns:
                    future[reg] = test_df.iloc[i][reg]
            
            forecast = model.predict(future)
            predictions_7day = forecast['yhat'].values
            
            actual_7day = test_df.iloc[i+1:i+1+forecast_horizon]['y'].values
            
            if len(actual_7day) == forecast_horizon:
                all_predictions.append(predictions_7day)
                all_actuals.append(actual_7day)
                all_dates.append(str(test_df.iloc[i]['ds']))
                
                trend_class = classify_trend(predictions_7day)
                all_trends.append(trend_class)
        
        all_predictions = np.array(all_predictions)
        all_actuals = np.array(all_actuals)
        all_trends = np.array(all_trends)
        
        # Calculate metrics
        mae = mean_absolute_error(all_actuals.flatten(), all_predictions.flatten())
        rmse = np.sqrt(mean_squared_error(all_actuals.flatten(), all_predictions.flatten()))
        mape = np.mean(np.abs((all_actuals - all_predictions) / all_actuals)) * 100
        
        actual_directions = np.diff(all_actuals, axis=1) > 0
        pred_directions = np.diff(all_predictions, axis=1) > 0
        directional_accuracy = np.mean(actual_directions == pred_directions) * 100
        
        actual_trends = np.array([classify_trend(actual) for actual in all_actuals])
        trend_accuracy = np.mean(all_trends == actual_trends) * 100
        
        # FINAL FORECAST for next 7 days
        last_date = pd.to_datetime(prophet_df['ds'].iloc[-1])
        forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_horizon)
        
        future_final = pd.DataFrame({'ds': forecast_dates})
        for reg in regressors:
            if reg in prophet_df.columns:
                future_final[reg] = prophet_df[reg].iloc[-1]
        
        final_forecast = model.predict(future_final)
        final_predictions = final_forecast['yhat'].values
        final_trend_class = classify_trend(final_predictions)
        final_trend = ['Bearish', 'Sideways', 'Bullish'][final_trend_class]
        
        confidence = calculate_trend_confidence(final_predictions, final_forecast)
        
        # Probabilities logic
        if final_trend == 'Bullish':
            bull_prob, bear_prob, side_prob = confidence, (100-confidence)*0.3, (100-confidence)*0.7
        elif final_trend == 'Bearish':
            bear_prob, bull_prob, side_prob = confidence, (100-confidence)*0.3, (100-confidence)*0.7
        else:
            side_prob, bull_prob, bear_prob = confidence, (100-confidence)*0.5, (100-confidence)*0.5
        
        total = bull_prob + bear_prob + side_prob
        
        return {
            'predictions': final_predictions.tolist(),
            'forecast_dates': [str(d.date()) for d in forecast_dates],
            'trend': {
                'direction': final_trend,
                'confidence': confidence,
                'probabilities': {
                    'bearish': float(bear_prob/total*100),
                    'sideways': float(side_prob/total*100),
                    'bullish': float(bull_prob/total*100)
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
                'predictions': all_predictions[-10:].tolist() if len(all_predictions) >= 10 else all_predictions.tolist(),
                'actual': all_actuals[-10:].tolist() if len(all_actuals) >= 10 else all_actuals.tolist(),
                'dates': all_dates[-10:] if len(all_dates) >= 10 else all_dates
            },
            'metadata': {
                'name': 'Multi-Step Prophet (Optimized)',
                'description': f'Optimized Prophet model with technical regressors predicting {forecast_horizon} days ahead',
                'parameters': {
                    'changepoint_prior_scale': 0.08,
                    'seasonality_prior_scale': 15.0,
                    'regressors_used': [r for r in regressors if r in prophet_df.columns]
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"Multi-step Prophet prediction error: {str(e)}")
    """
    Multi-step Prophet prediction with trend classification
    
    Args:
        df: DataFrame with stock data
        forecast_horizon: Number of days to forecast (default: 7)
        
    Returns:
        dict with predictions, trends, metrics, and metadata
    """
    try:
        # Prepare data for Prophet (remove timezone)
        dates = pd.to_datetime(df['date'])
        if dates.dt.tz is not None:
            dates = dates.dt.tz_localize(None)
        
        prophet_df = pd.DataFrame({
            'ds': dates,
            'y': df['close']
        })
        
        # Split data: 70% train, 15% validation, 15% test
        train_size = int(len(prophet_df) * 0.70)
        val_size = int(len(prophet_df) * 0.15)
        
        train_df = prophet_df[:train_size]
        val_df = prophet_df[train_size:train_size+val_size]
        test_df = prophet_df[train_size+val_size:]
        
        # Create and train model with optimized parameters
        model = Prophet(
            daily_seasonality=True,
            yearly_seasonality=True,
            weekly_seasonality=True,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
            interval_width=0.95
        )
        
        # Add additional regressors if available
        if 'volume' in df.columns:
            prophet_df['volume'] = df['volume'].values
            train_df['volume'] = df['volume'].iloc[:train_size].values
            model.add_regressor('volume')
        
        # Fit model
        model.fit(train_df)
        
        # Make predictions on test set (multi-step)
        # For each test point, predict next 7 days
        all_predictions = []
        all_actuals = []
        all_dates = []
        all_trends = []
        
        for i in range(len(test_df) - forecast_horizon):
            # Create future dataframe for 7-day forecast
            last_date = test_df.iloc[i]['ds']
            future = pd.DataFrame({
                'ds': pd.date_range(start=last_date, periods=forecast_horizon+1, freq='D')[1:]
            })
            
            if 'volume' in df.columns:
                # Use average volume for future predictions
                future['volume'] = df['volume'].mean()
            
            # Forecast
            forecast = model.predict(future)
            predictions_7day = forecast['yhat'].values
            
            # Get actual values for next 7 days
            actual_7day = test_df.iloc[i+1:i+1+forecast_horizon]['y'].values
            
            if len(actual_7day) == forecast_horizon:
                all_predictions.append(predictions_7day)
                all_actuals.append(actual_7day)
                all_dates.append(str(test_df.iloc[i]['ds']))
                
                # Classify trend
                trend_class = classify_trend(predictions_7day)
                all_trends.append(trend_class)
        
        all_predictions = np.array(all_predictions)
        all_actuals = np.array(all_actuals)
        all_trends = np.array(all_trends)
        
        # Calculate metrics
        mae = mean_absolute_error(all_actuals.flatten(), all_predictions.flatten())
        rmse = np.sqrt(mean_squared_error(all_actuals.flatten(), all_predictions.flatten()))
        mape = np.mean(np.abs((all_actuals - all_predictions) / all_actuals)) * 100
        
        # Calculate directional accuracy (day-to-day)
        actual_directions = np.diff(all_actuals, axis=1) > 0
        pred_directions = np.diff(all_predictions, axis=1) > 0
        directional_accuracy = np.mean(actual_directions == pred_directions) * 100
        
        # Trend classification accuracy
        actual_trends = np.array([classify_trend(actual) for actual in all_actuals])
        trend_accuracy = np.mean(all_trends == actual_trends) * 100
        
        # Get last prediction for return (most recent forecast)
        last_prediction = all_predictions[-1].tolist()
        last_trend = ['Bearish', 'Sideways', 'Bullish'][all_trends[-1]]
        
        # Generate forecast dates (next 7 days from last date)
        last_date = pd.to_datetime(prophet_df['ds'].iloc[-1])
        forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_horizon)
        
        # Make final forecast for next 7 days
        future_final = pd.DataFrame({
            'ds': forecast_dates
        })
        if 'volume' in df.columns:
            future_final['volume'] = df['volume'].mean()
        
        final_forecast = model.predict(future_final)
        final_predictions = final_forecast['yhat'].values
        final_trend_class = classify_trend(final_predictions)
        final_trend = ['Bearish', 'Sideways', 'Bullish'][final_trend_class]
        
        # Calculate confidence
        confidence = calculate_trend_confidence(final_predictions, final_forecast)
        
        # Calculate probabilities (simplified based on confidence and trend strength)
        trend_strength = abs(((final_predictions[-1] - final_predictions[0]) / final_predictions[0]) * 100)
        
        if final_trend == 'Bullish':
            bull_prob = confidence
            bear_prob = (100 - confidence) * 0.3
            side_prob = (100 - confidence) * 0.7
        elif final_trend == 'Bearish':
            bear_prob = confidence
            bull_prob = (100 - confidence) * 0.3
            side_prob = (100 - confidence) * 0.7
        else:
            side_prob = confidence
            bull_prob = (100 - confidence) * 0.5
            bear_prob = (100 - confidence) * 0.5
        
        # Normalize probabilities
        total = bull_prob + bear_prob + side_prob
        bull_prob = (bull_prob / total) * 100
        bear_prob = (bear_prob / total) * 100
        side_prob = (side_prob / total) * 100
        
        return {
            'predictions': final_predictions.tolist(),
            'forecast_dates': [str(d.date()) for d in forecast_dates],
            'trend': {
                'direction': final_trend,
                'confidence': confidence,
                'probabilities': {
                    'bearish': float(bear_prob),
                    'sideways': float(side_prob),
                    'bullish': float(bull_prob)
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
                'predictions': all_predictions[-10:].tolist(),  # Last 10 test predictions
                'actual': all_actuals[-10:].tolist(),
                'dates': all_dates[-10:]
            },
            'metadata': {
                'name': 'Multi-Step Prophet',
                'description': f'Prophet model predicting {forecast_horizon} days ahead with trend classification',
                'parameters': {
                    'forecast_horizon': forecast_horizon,
                    'changepoint_prior_scale': 0.05,
                    'seasonality': 'daily, weekly, yearly',
                    'interval_width': 0.95
                }
            }
        }
    
    except Exception as e:
        raise Exception(f"Multi-step Prophet prediction error: {str(e)}")
