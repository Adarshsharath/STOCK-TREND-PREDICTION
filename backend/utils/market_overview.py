import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import numpy as np


def get_market_indices():
    """
    Fetch major market indices data
    
    Returns:
        dict with indices data
    """
    try:
        indices = {
            'nifty50': '^NSEI',      # NIFTY 50
            'sensex': '^BSESN',      # S&P BSE Sensex
            'banknifty': '^NSEBANK', # Nifty Bank Index
            'sp500': '^GSPC',        # S&P 500
            'nasdaq': '^IXIC',       # NASDAQ
            'dowjones': '^DJI',      # Dow Jones
        }
        
        result = {}
        
        for key, symbol in indices.items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period='5d', interval='1d')
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
                    change = current_price - prev_close
                    change_percent = (change / prev_close * 100) if prev_close > 0 else 0
                    
                    # Get intraday data for mini chart
                    intraday = ticker.history(period='1d', interval='5m')
                    chart_data = []
                    if not intraday.empty:
                        chart_data = [
                            {
                                'time': idx.strftime('%H:%M'),
                                'price': float(price)
                            }
                            for idx, price in intraday['Close'].items()
                        ]
                    
                    result[key] = {
                        'symbol': symbol,
                        'name': get_index_name(key),
                        'price': float(current_price),
                        'change': float(change),
                        'change_percent': float(change_percent),
                        'chart_data': chart_data[-20:] if chart_data else []  # Last 20 points
                    }
            except Exception as e:
                print(f"Error fetching {key}: {str(e)}")
                continue
        
        return result
    
    except Exception as e:
        raise Exception(f"Error fetching market indices: {str(e)}")


def get_index_name(key):
    """Get display name for index"""
    names = {
        'nifty50': 'NIFTY 50',
        'sensex': 'S&P BSE Sensex',
        'banknifty': 'Nifty Bank Index',
        'sp500': 'S&P 500',
        'nasdaq': 'NASDAQ',
        'dowjones': 'Dow Jones'
    }
    return names.get(key, key.upper())


def generate_market_summary():
    """
    Generate AI-powered market summary based on current market conditions
    
    Returns:
        dict with market summary insights
    """
    try:
        # Fetch indices to analyze
        indices_data = get_market_indices()
        
        summaries = []
        
        # Analyze overall market sentiment
        total_changes = []
        for key, data in indices_data.items():
            if 'change_percent' in data:
                total_changes.append(data['change_percent'])
        
        if total_changes:
            avg_change = np.mean(total_changes)
            
            # Generate sentiment-based summary
            if avg_change > 1:
                sentiment = "Positive"
                mood = "📈 Markets Rally"
                summary_text = f"Global markets showing strong positive momentum with major indices gaining ground. "
            elif avg_change < -1:
                sentiment = "Negative"
                mood = "📉 Markets Under Pressure"
                summary_text = f"Markets facing downward pressure as major indices decline amid cautious investor sentiment. "
            else:
                sentiment = "Neutral"
                mood = "➡️ Markets Consolidate"
                summary_text = f"Markets trading in a narrow range as investors await fresh catalysts. "
            
            # Add specific index mentions
            for key, data in indices_data.items():
                if abs(data['change_percent']) > 1:
                    direction = "up" if data['change_percent'] > 0 else "down"
                    summary_text += f"{data['name']} {direction} {abs(data['change_percent']):.2f}%. "
        else:
            sentiment = "Neutral"
            mood = "📊 Market Update"
            summary_text = "Markets are currently being analyzed for the latest trends and movements."
        
        # Generate market insights
        insights = [
            {
                'title': mood,
                'description': summary_text,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        ]
        
        # Add sector-specific insights
        if 'nifty50' in indices_data and 'banknifty' in indices_data:
            nifty_change = indices_data['nifty50']['change_percent']
            bank_change = indices_data['banknifty']['change_percent']
            
            if abs(bank_change - nifty_change) > 1:
                if bank_change > nifty_change:
                    insights.append({
                        'title': '🏦 Banking Sector Outperforms',
                        'description': f'Banking stocks showing relative strength with Nifty Bank up {bank_change:.2f}% compared to broader market performance.',
                        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
                else:
                    insights.append({
                        'title': '🏦 Banking Sector Lags',
                        'description': f'Banking stocks underperforming broader indices with Nifty Bank down {abs(bank_change):.2f}%.',
                        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
        
        # Add global market context
        if 'sp500' in indices_data and 'nasdaq' in indices_data:
            sp_change = indices_data['sp500']['change_percent']
            nasdaq_change = indices_data['nasdaq']['change_percent']
            
            if sp_change > 0.5 or nasdaq_change > 0.5:
                insights.append({
                    'title': '🌍 Positive Global Cues',
                    'description': f'US markets providing support with S&P 500 and NASDAQ showing gains, boosting global investor confidence.',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
            elif sp_change < -0.5 or nasdaq_change < -0.5:
                insights.append({
                    'title': '🌍 Global Market Weakness',
                    'description': f'Weakness in US markets weighing on global sentiment as investors turn cautious.',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
        
        return {
            'sentiment': sentiment,
            'insights': insights,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    
    except Exception as e:
        return {
            'sentiment': 'Neutral',
            'insights': [{
                'title': '📊 Market Summary',
                'description': 'Market data is being updated. Please check back shortly.',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }],
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }


def get_top_gainers_losers(market='US', limit=5):
    """
    Get top gainers and losers
    
    Args:
        market: 'US' or 'IN' for market selection
        limit: Number of stocks to return
    
    Returns:
        dict with gainers and losers
    """
    try:
        # Popular stocks to check
        if market == 'US':
            symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'NFLX', 'DIS']
        else:
            symbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 
                      'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'LT.NS']
        
        stocks_data = []
        
        for symbol in symbols:
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period='2d')
                
                if len(hist) >= 2:
                    current = hist['Close'].iloc[-1]
                    previous = hist['Close'].iloc[-2]
                    change_pct = ((current - previous) / previous * 100)
                    
                    stocks_data.append({
                        'symbol': symbol,
                        'name': symbol.replace('.NS', ''),
                        'price': float(current),
                        'change_percent': float(change_pct)
                    })
            except:
                continue
        
        # Sort and get top gainers and losers
        stocks_data.sort(key=lambda x: x['change_percent'], reverse=True)
        
        return {
            'gainers': stocks_data[:limit],
            'losers': stocks_data[-limit:][::-1]
        }
    
    except Exception as e:
        return {
            'gainers': [],
            'losers': []
        }
