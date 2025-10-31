import pandas as pd
import numpy as np
from ta.volatility import AverageTrueRange


def calculate_atr_volatility(df, period=14, forecast_days=1):
    """
    Calculate Average True Range (ATR) for volatility prediction
    
    Args:
        df: DataFrame with stock data (must have 'high', 'low', 'close')
        period: ATR period (default: 14)
        forecast_days: Number of days to forecast (default: 1)
    
    Returns:
        dict with volatility metrics and prediction
    """
    try:
        df = df.copy()
        
        # Calculate ATR
        atr_indicator = AverageTrueRange(
            high=df['high'],
            low=df['low'],
            close=df['close'],
            window=period
        )
        df['atr'] = atr_indicator.average_true_range()
        
        # Get last 5 days of high-low range
        df['daily_range'] = df['high'] - df['low']
        last_5_days = df.tail(5)
        
        # Calculate volatility metrics
        current_atr = df['atr'].iloc[-1]
        avg_range_5d = last_5_days['daily_range'].mean()
        std_range_5d = last_5_days['daily_range'].std()
        current_price = df['close'].iloc[-1]
        
        # Predict next-day volatility using ATR and recent volatility trend
        predicted_volatility_dollar = current_atr * 1.1  # Slight adjustment for next day
        predicted_volatility_percent = (predicted_volatility_dollar / current_price) * 100
        
        # Classify volatility level
        if predicted_volatility_percent < 1.5:
            volatility_level = 'Low'
            color = '#10b981'  # green
        elif predicted_volatility_percent < 3.0:
            volatility_level = 'Moderate'
            color = '#f59e0b'  # orange
        else:
            volatility_level = 'High'
            color = '#ef4444'  # red
        
        # Prepare historical data for chart
        historical_ranges = df.tail(30)[['date', 'daily_range', 'atr']].copy()
        historical_ranges['date'] = historical_ranges['date'].astype(str)
        
        return {
            'current_atr': float(current_atr),
            'predicted_volatility_dollar': float(predicted_volatility_dollar),
            'predicted_volatility_percent': float(predicted_volatility_percent),
            'volatility_level': volatility_level,
            'color': color,
            'avg_range_5d': float(avg_range_5d),
            'std_range_5d': float(std_range_5d),
            'current_price': float(current_price),
            'historical_data': historical_ranges.to_dict('records')
        }
    
    except Exception as e:
        raise Exception(f"ATR volatility calculation error: {str(e)}")


def analyze_market_sentiment(df):
    """
    Analyze market sentiment based on price action and technical indicators
    
    Args:
        df: DataFrame with stock data
    
    Returns:
        dict with sentiment analysis
    """
    try:
        df = df.copy()
        
        # Calculate price momentum
        df['return_1d'] = df['close'].pct_change(1)
        df['return_5d'] = df['close'].pct_change(5)
        df['return_20d'] = df['close'].pct_change(20)
        
        # Calculate moving averages
        df['ma_20'] = df['close'].rolling(window=20).mean()
        df['ma_50'] = df['close'].rolling(window=50).mean()
        
        # Recent data
        latest = df.iloc[-1]
        prev_5d = df.tail(5)
        
        # Price momentum analysis
        return_1d = latest['return_1d'] * 100
        return_5d = latest['return_5d'] * 100
        return_20d = latest['return_20d'] * 100
        
        # Trend analysis
        price_above_ma20 = latest['close'] > latest['ma_20']
        price_above_ma50 = latest['close'] > latest['ma_50']
        ma20_above_ma50 = latest['ma_20'] > latest['ma_50']
        
        # Volume analysis (if available)
        volume_trend = "stable"
        if 'volume' in df.columns:
            avg_volume = df['volume'].tail(20).mean()
            current_volume = latest['volume']
            if current_volume > avg_volume * 1.2:
                volume_trend = "increasing"
            elif current_volume < avg_volume * 0.8:
                volume_trend = "decreasing"
        
        # Determine overall sentiment
        bullish_signals = sum([
            return_1d > 0,
            return_5d > 2,
            return_20d > 5,
            price_above_ma20,
            price_above_ma50,
            ma20_above_ma50,
            volume_trend == "increasing"
        ])
        
        bearish_signals = sum([
            return_1d < 0,
            return_5d < -2,
            return_20d < -5,
            not price_above_ma20,
            not price_above_ma50,
            not ma20_above_ma50,
            volume_trend == "decreasing"
        ])
        
        # Classify sentiment
        if bullish_signals >= 5:
            sentiment = "Bullish"
            sentiment_score = 80 + (bullish_signals - 5) * 5
            color = "#10b981"
            emoji = "📈"
        elif bullish_signals >= 3:
            sentiment = "Moderately Bullish"
            sentiment_score = 60 + (bullish_signals - 3) * 10
            color = "#22c55e"
            emoji = "📊"
        elif bearish_signals >= 5:
            sentiment = "Bearish"
            sentiment_score = 20 - (bearish_signals - 5) * 5
            color = "#ef4444"
            emoji = "📉"
        elif bearish_signals >= 3:
            sentiment = "Moderately Bearish"
            sentiment_score = 40 - (bearish_signals - 3) * 10
            color = "#f97316"
            emoji = "⚠️"
        else:
            sentiment = "Neutral"
            sentiment_score = 50
            color = "#f59e0b"
            emoji = "➡️"
        
        # Generate sentiment summary
        summary = generate_sentiment_summary(
            sentiment, return_1d, return_5d, return_20d,
            price_above_ma20, price_above_ma50, volume_trend
        )
        
        # Key insights
        insights = []
        if abs(return_1d) > 3:
            insights.append(f"Strong {'upward' if return_1d > 0 else 'downward'} momentum today")
        if price_above_ma20 and price_above_ma50:
            insights.append("Price trading above key moving averages")
        elif not price_above_ma20 and not price_above_ma50:
            insights.append("Price below key moving averages")
        if volume_trend == "increasing":
            insights.append("Elevated trading volume observed")
        
        return {
            'sentiment': sentiment,
            'sentiment_score': max(0, min(100, int(sentiment_score))),
            'color': color,
            'emoji': emoji,
            'summary': summary,
            'insights': insights,
            'metrics': {
                'return_1d': float(return_1d),
                'return_5d': float(return_5d),
                'return_20d': float(return_20d),
                'price_vs_ma20': 'above' if price_above_ma20 else 'below',
                'price_vs_ma50': 'above' if price_above_ma50 else 'below',
                'volume_trend': volume_trend
            }
        }
    
    except Exception as e:
        raise Exception(f"Sentiment analysis error: {str(e)}")


def generate_sentiment_summary(sentiment, return_1d, return_5d, return_20d, 
                                price_above_ma20, price_above_ma50, volume_trend):
    """Generate a human-readable sentiment summary"""
    
    if "Bullish" in sentiment:
        base_text = f"The stock shows {sentiment.lower()} momentum with"
        
        details = []
        if return_1d > 1:
            details.append(f"a +{return_1d:.1f}% gain today")
        if return_5d > 2:
            details.append(f"+{return_5d:.1f}% over the past 5 days")
        if price_above_ma20 and price_above_ma50:
            details.append("strong technical support")
        if volume_trend == "increasing":
            details.append("rising volume confirming the trend")
        
        if details:
            return base_text + " " + ", ".join(details) + "."
        return f"The market sentiment for this stock is {sentiment.lower()}."
    
    elif "Bearish" in sentiment:
        base_text = f"The stock exhibits {sentiment.lower()} pressure with"
        
        details = []
        if return_1d < -1:
            details.append(f"a {return_1d:.1f}% decline today")
        if return_5d < -2:
            details.append(f"{return_5d:.1f}% drop over 5 days")
        if not price_above_ma20 or not price_above_ma50:
            details.append("weakness against key moving averages")
        if volume_trend == "increasing":
            details.append("selling volume increasing")
        
        if details:
            return base_text + " " + ", ".join(details) + "."
        return f"The market sentiment for this stock is {sentiment.lower()}."
    
    else:
        return f"The stock is trading in a neutral range with limited directional bias. " \
               f"Recent price action shows {return_5d:+.1f}% change over 5 days."
