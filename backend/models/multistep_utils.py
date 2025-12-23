"""
Shared utilities for multi-step forecasting models
Common functions used across all multi-step prediction models
"""

import numpy as np
import pandas as pd


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


def calculate_trend_probabilities(predictions, confidence):
    """
    Calculate probabilities for each trend class
    
    Args:
        predictions: Array of predicted prices
        confidence: Confidence score (0-100)
        
    Returns:
        Dict with bearish, sideways, bullish probabilities
    """
    trend_class = classify_trend(predictions)
    trend_names = ['Bearish', 'Sideways', 'Bullish']
    trend_name = trend_names[trend_class]
    
    # Calculate trend strength
    start_price = predictions[0]
    end_price = predictions[-1]
    trend_strength = abs(((end_price - start_price) / start_price) * 100)
    
    # Distribute probabilities based on confidence and trend
    if trend_name == 'Bullish':
        bull_prob = confidence
        bear_prob = (100 - confidence) * 0.3
        side_prob = (100 - confidence) * 0.7
    elif trend_name == 'Bearish':
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
        'bearish': float(bear_prob),
        'sideways': float(side_prob),
        'bullish': float(bull_prob)
    }


def calculate_confidence(predictions, actual=None, mae=None):
    """
    Calculate confidence score based on prediction quality
    
    Args:
        predictions: Array of predicted prices
        actual: Optional actual prices for comparison
        mae: Optional mean absolute error
        
    Returns:
        Confidence score (0-100)
    """
    if actual is not None and mae is not None:
        # Use MAE-based confidence
        avg_price = np.mean(actual)
        error_ratio = mae / avg_price
        confidence = max(50, min(95, 100 - (error_ratio * 200)))
    else:
        # Use prediction stability as proxy
        price_volatility = np.std(predictions) / np.mean(predictions)
        confidence = max(50, min(95, 100 - (price_volatility * 300)))
    
    return float(confidence)


def create_technical_features(df):
    """
    Create comprehensive technical indicators
    
    Args:
        df: DataFrame with OHLCV data
        
    Returns:
        DataFrame with additional technical features
    """
    data = df.copy()
    
    # Price-based features
    data['returns'] = data['close'].pct_change()
    
    # Moving Averages
    data['sma_5'] = data['close'].rolling(window=5).mean()
    data['sma_10'] = data['close'].rolling(window=10).mean()
    data['sma_20'] = data['close'].rolling(window=20).mean()
    data['ema_12'] = data['close'].ewm(span=12, adjust=False).mean()
    data['ema_26'] = data['close'].ewm(span=26, adjust=False).mean()
    
    # MACD
    data['macd'] = data['ema_12'] - data['ema_26']
    data['macd_signal'] = data['macd'].ewm(span=9, adjust=False).mean()
    
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
    
    # Volume features
    if 'volume' in data.columns:
        data['volume_sma'] = data['volume'].rolling(window=20).mean()
        data['volume_ratio'] = data['volume'] / data['volume_sma']
    
    # Lag features
    for lag in [1, 3, 7]:
        data[f'close_lag_{lag}'] = data['close'].shift(lag)
    
    # Drop NaN values
    data = data.dropna()
    
    return data


def format_multistep_response(predictions, forecast_dates, all_predictions, all_actuals, 
                               all_dates, all_trends, actual_trends, forecast_horizon):
    """
    Format response in standardized multi-step format
    
    Args:
        predictions: Final 7-day predictions
        forecast_dates: Dates for forecast
        all_predictions: All test predictions
        all_actuals: All test actual values
        all_dates: All test dates
        all_trends: Predicted trends
        actual_trends: Actual trends
        forecast_horizon: Number of days forecasted
        
    Returns:
        Formatted response dict
    """
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    
    # Calculate metrics
    mae = mean_absolute_error(all_actuals.flatten(), all_predictions.flatten())
    rmse = np.sqrt(mean_squared_error(all_actuals.flatten(), all_predictions.flatten()))
    mape = np.mean(np.abs((all_actuals - all_predictions) / all_actuals)) * 100
    
    # Directional accuracy
    actual_directions = np.diff(all_actuals, axis=1) > 0
    pred_directions = np.diff(all_predictions, axis=1) > 0
    directional_accuracy = np.mean(actual_directions == pred_directions) * 100
    
    # Trend accuracy
    trend_accuracy = np.mean(all_trends == actual_trends) * 100
    
    # Final trend
    final_trend_class = classify_trend(predictions)
    final_trend = ['Bearish', 'Sideways', 'Bullish'][final_trend_class]
    
    # Confidence
    confidence = calculate_confidence(predictions, all_actuals.flatten(), mae)
    
    # Probabilities
    probabilities = calculate_trend_probabilities(predictions, confidence)
    
    return {
        'predictions': predictions.tolist() if isinstance(predictions, np.ndarray) else predictions,
        'forecast_dates': [str(d) for d in forecast_dates],
        'trend': {
            'direction': final_trend,
            'confidence': confidence,
            'probabilities': probabilities
        },
        'metrics': {
            'mae': float(mae),
            'rmse': float(rmse),
            'mape': float(mape),
            'directional_accuracy': float(directional_accuracy),
            'trend_accuracy': float(trend_accuracy)
        },
        'test_results': {
            'predictions': all_predictions[-10:].tolist() if len(all_predictions) > 10 else all_predictions.tolist(),
            'actual': all_actuals[-10:].tolist() if len(all_actuals) > 10 else all_actuals.tolist(),
            'dates': all_dates[-10:] if len(all_dates) > 10 else all_dates
        }
    }
