import yfinance as yf
from datetime import datetime

def fetch_market_valuation(symbol):
    """
    Fetch real-time market valuation and company data
    
    Args:
        symbol: Stock ticker symbol
    
    Returns:
        dict with market valuation data
    """
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        history = ticker.history(period='1d')
        
        if history.empty:
            return {
                'error': f'No data found for symbol: {symbol}',
                'symbol': symbol
            }
        
        current_price = history['Close'].iloc[-1]
        previous_close = info.get('previousClose', current_price)
        change = current_price - previous_close
        change_percent = (change / previous_close * 100) if previous_close else 0
        
        return {
            'symbol': symbol,
            'company_name': info.get('longName', info.get('shortName', symbol)),
            'current_price': float(current_price),
            'previous_close': float(previous_close),
            'change': float(change),
            'change_percent': float(change_percent),
            'market_cap': info.get('marketCap', None),
            'volume': int(history['Volume'].iloc[-1]) if not history.empty else None,
            'avg_volume': info.get('averageVolume', None),
            'pe_ratio': info.get('trailingPE', None),
            'forward_pe': info.get('forwardPE', None),
            'dividend_yield': info.get('dividendYield', None),
            'beta': info.get('beta', None),
            'week_52_high': info.get('fiftyTwoWeekHigh', None),
            'week_52_low': info.get('fiftyTwoWeekLow', None),
            'day_high': float(history['High'].iloc[-1]) if not history.empty else None,
            'day_low': float(history['Low'].iloc[-1]) if not history.empty else None,
            'open': float(history['Open'].iloc[-1]) if not history.empty else None,
            'sector': info.get('sector', None),
            'industry': info.get('industry', None),
            'country': info.get('country', None),
            'website': info.get('website', None),
            'description': info.get('longBusinessSummary', None),
            'employees': info.get('fullTimeEmployees', None),
            'exchange': info.get('exchange', None),
            'currency': info.get('currency', 'INR'),
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'symbol': symbol,
            'message': f'Unable to fetch market data for {symbol}',
            'status': 'error'
        }

def get_market_summary(symbols):
    """
    Get market summary for multiple symbols
    
    Args:
        symbols: List of stock symbols
    
    Returns:
        dict with market summary data
    """
    try:
        summaries = []
        for symbol in symbols:
            data = fetch_market_valuation(symbol)
            if data.get('status') == 'success':
                summaries.append({
                    'symbol': symbol,
                    'company': data.get('company_name', symbol),
                    'price': data.get('current_price'),
                    'change_percent': data.get('change_percent'),
                    'market_cap': data.get('market_cap'),
                    'volume': data.get('volume')
                })
        
        return {
            'summaries': summaries,
            'total': len(summaries),
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {
            'error': str(e),
            'summaries': []
        }
