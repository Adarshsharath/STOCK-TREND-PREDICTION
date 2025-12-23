import numpy as np
import pandas as pd


def generate_prediction_reasoning(df, predictions, actual, metrics, model_name):
    """
    Generate AI reasoning for why the model made its prediction
    
    Args:
        df: Original stock data DataFrame
        predictions: Model predictions array
        actual: Actual values array
        metrics: Model performance metrics
        model_name: Name of the model used
    
    Returns:
        dict with reasoning summary and key factors
    """
    try:
        # Calculate prediction trend
        prediction_start = predictions[0] if len(predictions) > 0 else 0
        prediction_end = predictions[-1] if len(predictions) > 0 else 0
        prediction_change = prediction_end - prediction_start
        prediction_change_percent = (prediction_change / prediction_start * 100) if prediction_start > 0 else 0
        
        # Determine trend direction
        if prediction_change_percent > 1:
            trend = "Upward"
            trend_emoji = "📈"
            trend_color = "#10b981"
        elif prediction_change_percent < -1:
            trend = "Downward"
            trend_emoji = "📉"
            trend_color = "#ef4444"
        else:
            trend = "Neutral"
            trend_emoji = "➡️"
            trend_color = "#f59e0b"
        
        # Analyze recent price movements
        recent_data = df.tail(20).copy()
        price_momentum = recent_data['close'].pct_change().mean() * 100
        volatility = recent_data['close'].std()
        current_price = df['close'].iloc[-1]
        
        # Calculate confidence based on metrics
        directional_accuracy = metrics.get('directional_accuracy', 50)
        mae = metrics.get('mae', 0)
        mae_percent = (mae / current_price * 100) if current_price > 0 else 5
        
        if directional_accuracy > 70 and mae_percent < 3:
            confidence_level = "High"
            confidence_score = 85
            confidence_color = "#10b981"
        elif directional_accuracy > 55 and mae_percent < 5:
            confidence_level = "Moderate"
            confidence_score = 65
            confidence_color = "#f59e0b"
        else:
            confidence_level = "Low"
            confidence_score = 45
            confidence_color = "#ef4444"
        
        # Generate key factors
        factors = []
        
        # Factor 1: Price momentum
        if abs(price_momentum) > 1:
            direction = "upward" if price_momentum > 0 else "downward"
            factors.append({
                'title': 'Price Momentum',
                'description': f'Recent {direction} momentum of {abs(price_momentum):.2f}% supports the {trend.lower()} prediction',
                'impact': 'high' if abs(price_momentum) > 2 else 'medium',
                'icon': '📊'
            })
        
        # Factor 2: Model characteristics
        model_strengths = {
            'LSTM': 'captures complex long-term patterns and temporal dependencies',
            'Prophet': 'identifies seasonal trends and cyclical patterns',
            'ARIMA': 'analyzes short-term statistical patterns',
            'Random Forest': 'evaluates multiple decision paths and feature interactions',
            'XGBoost': 'optimizes prediction accuracy through gradient boosting'
        }
        
        model_strength = model_strengths.get(model_name, 'analyzes historical patterns')
        factors.append({
            'title': f'{model_name} Analysis',
            'description': f'The {model_name} model {model_strength} in the historical data',
            'impact': 'high',
            'icon': '🤖'
        })
        
        # Factor 3: Directional accuracy
        if directional_accuracy > 60:
            factors.append({
                'title': 'Historical Accuracy',
                'description': f'Model achieved {directional_accuracy:.1f}% directional accuracy on test data',
                'impact': 'high' if directional_accuracy > 70 else 'medium',
                'icon': '🎯'
            })
        
        # Factor 4: Volatility consideration
        if volatility > current_price * 0.02:
            factors.append({
                'title': 'Market Volatility',
                'description': f'Higher volatility detected (₹{volatility:.2f}), prediction range may be wider',
                'impact': 'medium',
                'icon': '⚠️'
            })
        
        # Factor 5: Prediction magnitude
        if abs(prediction_change_percent) > 5:
            factors.append({
                'title': 'Strong Signal',
                'description': f'Model predicts significant {abs(prediction_change_percent):.1f}% price movement',
                'impact': 'high',
                'icon': '💪'
            })
        
        # Generate reasoning summary
        summary = generate_reasoning_summary(
            trend, prediction_change_percent, model_name, 
            directional_accuracy, confidence_level, price_momentum
        )
        
        # Generate actionable insight
        insight = generate_actionable_insight(
            trend, prediction_change_percent, confidence_level, volatility, current_price
        )
        
        return {
            'summary': summary,
            'trend': trend,
            'trend_emoji': trend_emoji,
            'trend_color': trend_color,
            'prediction_change_percent': float(prediction_change_percent),
            'confidence_level': confidence_level,
            'confidence_score': confidence_score,
            'confidence_color': confidence_color,
            'factors': factors,
            'insight': insight,
            'metadata': {
                'current_price': float(current_price),
                'predicted_price': float(prediction_end),
                'price_change': float(prediction_change),
                'directional_accuracy': float(directional_accuracy),
                'mae_percent': float(mae_percent)
            }
        }
    
    except Exception as e:
        # Return default reasoning if error occurs
        return {
            'summary': f'The {model_name} model has analyzed the historical data and generated predictions based on learned patterns.',
            'trend': 'Neutral',
            'trend_emoji': '➡️',
            'trend_color': '#f59e0b',
            'prediction_change_percent': 0.0,
            'confidence_level': 'Moderate',
            'confidence_score': 50,
            'confidence_color': '#f59e0b',
            'factors': [],
            'insight': 'Review the prediction chart and metrics for detailed analysis.',
            'metadata': {}
        }


def generate_reasoning_summary(trend, change_percent, model_name, accuracy, confidence, momentum):
    """Generate a human-readable reasoning summary"""
    
    if trend == "Upward":
        base = f"The {model_name} model predicts an {trend.lower()} trend with an expected price increase of {abs(change_percent):.2f}%. "
        
        if confidence == "High":
            detail = f"This prediction is supported by strong historical accuracy ({accuracy:.1f}%) and positive price momentum. "
        elif confidence == "Moderate":
            detail = f"The prediction shows moderate confidence based on recent price patterns. "
        else:
            detail = f"This prediction has lower confidence due to mixed signals in the data. "
        
        conclusion = "The model identifies bullish patterns that suggest potential upside movement."
        
    elif trend == "Downward":
        base = f"The {model_name} model predicts a {trend.lower()} trend with an expected price decrease of {abs(change_percent):.2f}%. "
        
        if confidence == "High":
            detail = f"This prediction is backed by strong model accuracy ({accuracy:.1f}%) and negative momentum indicators. "
        elif confidence == "Moderate":
            detail = f"The prediction shows moderate confidence based on recent price weakness. "
        else:
            detail = f"This prediction has lower confidence due to mixed market signals. "
        
        conclusion = "The model detects bearish patterns suggesting potential downside pressure."
        
    else:
        base = f"The {model_name} model predicts a {trend.lower()} trend with minimal expected price movement. "
        detail = f"The model indicates market consolidation with no strong directional bias. "
        conclusion = "Price action is expected to remain range-bound in the near term."
    
    return base + detail + conclusion


def generate_actionable_insight(trend, change_percent, confidence, volatility, current_price):
    """Generate actionable insights for traders"""
    
    if trend == "Upward" and confidence in ["High", "Moderate"]:
        return f"Consider a long position with a target of +{abs(change_percent):.1f}% and stop-loss at key support levels."
    
    elif trend == "Downward" and confidence in ["High", "Moderate"]:
        return f"Exercise caution on long positions. Consider waiting for support confirmation or protective stops."
    
    elif volatility > current_price * 0.03:
        return f"High volatility detected. Consider using wider stop-losses and smaller position sizes to manage risk."
    
    else:
        return f"Neutral outlook suggests range-trading strategies may be more effective in current conditions."
