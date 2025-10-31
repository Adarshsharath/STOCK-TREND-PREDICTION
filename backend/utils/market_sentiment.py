import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def analyze_market_sentiment(symbol):
    """
    Analyze market sentiment using technical indicators and price action
    
    Args:
        symbol: Stock ticker symbol
    
    Returns:
        dict with sentiment analysis
    """
    try:
        ticker = yf.Ticker(symbol)
        
        # Get 90 days of data for analysis
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        df = ticker.history(start=start_date, end=end_date)
        
        if df.empty or len(df) < 20:
            return {
                'error': 'Insufficient data for sentiment analysis',
                'symbol': symbol
            }
        
        # Calculate technical indicators
        current_price = df['Close'].iloc[-1]
        
        # Price momentum (5-day, 20-day)
        momentum_5d = ((df['Close'].iloc[-1] / df['Close'].iloc[-5]) - 1) * 100
        momentum_20d = ((df['Close'].iloc[-1] / df['Close'].iloc[-20]) - 1) * 100
        
        # Moving averages
        ma_20 = df['Close'].rolling(window=20).mean().iloc[-1]
        ma_50 = df['Close'].rolling(window=50).mean().iloc[-1] if len(df) >= 50 else ma_20
        
        # Volume trend
        avg_volume = df['Volume'].rolling(window=20).mean().iloc[-1]
        recent_volume = df['Volume'].iloc[-5:].mean()
        volume_trend = ((recent_volume / avg_volume) - 1) * 100
        
        # Volatility (ATR)
        high_low = df['High'] - df['Low']
        high_close = abs(df['High'] - df['Close'].shift())
        low_close = abs(df['Low'] - df['Close'].shift())
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(window=14).mean().iloc[-1]
        atr_percent = (atr / current_price) * 100
        
        # RSI calculation
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs.iloc[-1]))
        
        # Determine sentiment
        sentiment_score = 0
        factors = []
        
        # Price momentum factors
        if momentum_5d > 5:
            sentiment_score += 2
            factors.append("Strong 5-day momentum (+)")
        elif momentum_5d > 0:
            sentiment_score += 1
            factors.append("Positive 5-day trend")
        elif momentum_5d < -5:
            sentiment_score -= 2
            factors.append("Weak 5-day momentum (-)")
        else:
            sentiment_score -= 1
            factors.append("Negative 5-day trend")
        
        if momentum_20d > 10:
            sentiment_score += 2
            factors.append("Strong 20-day uptrend (+)")
        elif momentum_20d > 0:
            sentiment_score += 1
            factors.append("Positive 20-day trend")
        elif momentum_20d < -10:
            sentiment_score -= 2
            factors.append("Sharp 20-day decline (-)")
        else:
            sentiment_score -= 1
            factors.append("Negative 20-day trend")
        
        # MA position
        if current_price > ma_20 > ma_50:
            sentiment_score += 2
            factors.append("Price above key MAs (+)")
        elif current_price > ma_20:
            sentiment_score += 1
            factors.append("Price above 20-day MA")
        elif current_price < ma_50:
            sentiment_score -= 2
            factors.append("Price below key MAs (-)")
        else:
            sentiment_score -= 1
            factors.append("Mixed MA signals")
        
        # Volume analysis
        if volume_trend > 20:
            sentiment_score += 1
            factors.append("Rising volume (+)")
        elif volume_trend < -20:
            sentiment_score -= 1
            factors.append("Declining volume (-)")
        
        # RSI analysis
        if rsi > 70:
            sentiment_score -= 1
            factors.append("Overbought RSI (caution)")
        elif rsi < 30:
            sentiment_score += 1
            factors.append("Oversold RSI (opportunity)")
        
        # Volatility assessment
        volatility_level = "Low"
        if atr_percent > 5:
            volatility_level = "Very High"
        elif atr_percent > 3:
            volatility_level = "High"
        elif atr_percent > 1.5:
            volatility_level = "Moderate"
        
        # Determine overall sentiment
        if sentiment_score >= 6:
            sentiment = "Very Bullish"
            sentiment_label = "🚀 Very Bullish"
            confidence = 85 + min(sentiment_score - 6, 15)
            recommendation = "Strong Buy"
            color = "green"
        elif sentiment_score >= 3:
            sentiment = "Bullish"
            sentiment_label = "📈 Bullish"
            confidence = 70 + (sentiment_score - 3) * 5
            recommendation = "Buy"
            color = "lightgreen"
        elif sentiment_score >= 0:
            sentiment = "Neutral"
            sentiment_label = "➡️ Neutral"
            confidence = 60 + sentiment_score * 3
            recommendation = "Hold"
            color = "yellow"
        elif sentiment_score >= -3:
            sentiment = "Bearish"
            sentiment_label = "📉 Bearish"
            confidence = 45 + abs(sentiment_score) * 5
            recommendation = "Sell"
            color = "orange"
        else:
            sentiment = "Very Bearish"
            sentiment_label = "🔴 Very Bearish"
            confidence = 30 + min(abs(sentiment_score) - 3, 15)
            recommendation = "Strong Sell"
            color = "red"
        
        # Generate AI summary
        summary = generate_sentiment_summary(
            symbol, sentiment, momentum_5d, momentum_20d, 
            rsi, volume_trend, volatility_level
        )
        
        return {
            'symbol': symbol,
            'sentiment': sentiment,
            'sentiment_label': sentiment_label,
            'sentiment_score': sentiment_score,
            'confidence': round(confidence, 1),
            'recommendation': recommendation,
            'color': color,
            'current_price': float(current_price),
            'momentum_5d': round(momentum_5d, 2),
            'momentum_20d': round(momentum_20d, 2),
            'rsi': round(rsi, 1),
            'volume_trend': round(volume_trend, 1),
            'volatility_level': volatility_level,
            'atr_percent': round(atr_percent, 2),
            'factors': factors,
            'summary': summary,
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'symbol': symbol,
            'status': 'error'
        }

def generate_sentiment_summary(symbol, sentiment, momentum_5d, momentum_20d, rsi, volume_trend, volatility_level):
    """Generate AI-like summary text"""
    
    # Momentum description
    if momentum_5d > 5:
        momentum_desc = f"showing strong momentum with {abs(momentum_5d):.1f}% gain in 5 days"
    elif momentum_5d > 0:
        momentum_desc = f"trending upward with {momentum_5d:.1f}% gain recently"
    elif momentum_5d < -5:
        momentum_desc = f"experiencing weakness with {abs(momentum_5d):.1f}% decline in 5 days"
    else:
        momentum_desc = f"showing slight weakness with {abs(momentum_5d):.1f}% decline"
    
    # Volume description
    if volume_trend > 20:
        volume_desc = "with increased buying interest"
    elif volume_trend < -20:
        volume_desc = "on declining volume"
    else:
        volume_desc = "on normal volume"
    
    # RSI context
    if rsi > 70:
        rsi_desc = "The RSI suggests overbought conditions, indicating potential pullback risk."
    elif rsi < 30:
        rsi_desc = "The RSI indicates oversold conditions, presenting a potential buying opportunity."
    else:
        rsi_desc = f"The RSI at {rsi:.0f} suggests balanced market conditions."
    
    # Volatility context
    vol_desc = f"{volatility_level.lower()} volatility environment"
    
    summary = f"{symbol} is currently {sentiment.lower()}, {momentum_desc} {volume_desc}. "
    summary += f"{rsi_desc} "
    summary += f"The stock is trading in a {vol_desc}, "
    
    if sentiment in ["Very Bullish", "Bullish"]:
        summary += "suggesting continued upward potential with manageable risk."
    elif sentiment == "Neutral":
        summary += "indicating a wait-and-see approach may be prudent."
    else:
        summary += "warranting caution and potential risk management."
    
    return summary
