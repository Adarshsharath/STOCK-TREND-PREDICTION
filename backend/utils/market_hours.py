"""
Market hours validation utility
Checks if a given market is currently open for trading
"""

from datetime import datetime, time
import pytz

# Market trading hours (in local timezone)
MARKET_HOURS = {
    'NSE': {  # National Stock Exchange of India
        'timezone': 'Asia/Kolkata',
        'trading_days': [0, 1, 2, 3, 4],  # Monday to Friday
        'open_time': time(9, 15),
        'close_time': time(15, 30),
        'suffixes': ['.NS', '.BO']  # NSE and BSE suffixes
    },
    'NYSE': {  # New York Stock Exchange
        'timezone': 'America/New_York',
        'trading_days': [0, 1, 2, 3, 4],  # Monday to Friday
        'open_time': time(9, 30),
        'close_time': time(16, 0),
        'suffixes': []  # No suffix for US stocks
    },
    'NASDAQ': {
        'timezone': 'America/New_York',
        'trading_days': [0, 1, 2, 3, 4],
        'open_time': time(9, 30),
        'close_time': time(16, 0),
        'suffixes': []
    }
}

def get_market_for_symbol(symbol):
    """
    Determine which market a symbol belongs to based on suffix
    
    Args:
        symbol (str): Stock symbol (e.g., 'RELIANCE.NS', 'AAPL')
    
    Returns:
        str: Market identifier ('NSE', 'NYSE', etc.) or None
    """
    symbol_upper = symbol.upper()
    
    # Check for Indian market suffixes
    if any(symbol_upper.endswith(suffix) for suffix in MARKET_HOURS['NSE']['suffixes']):
        return 'NSE'
    
    # Default to US markets for symbols without suffix
    return 'NYSE'

# Market Holidays (YYYY-MM-DD format)
MARKET_HOLIDAYS = {
    'NSE': [
        # 2024
        '2024-01-26', '2024-03-08', '2024-03-25', '2024-03-29', '2024-04-11',
        '2024-04-17', '2024-05-01', '2024-06-17', '2024-07-17', '2024-08-15',
        '2024-10-02', '2024-11-01', '2024-11-15', '2024-12-25',
        # 2025
        '2025-01-26', '2025-03-14', '2025-03-31', '2025-04-10', '2025-04-18',
        '2025-05-01', '2025-08-15', '2025-10-02', '2025-10-21', '2025-12-25',
        # 2026
        '2026-01-26', '2026-03-03', '2026-03-26', '2026-03-31', '2026-04-03',
        '2026-04-14', '2026-05-01', '2026-05-28', '2026-06-26', '2026-09-14',
        '2026-10-02', '2026-10-20', '2026-11-10', '2026-11-24', '2026-12-25'
    ],
    'NYSE': [
        # 2024
        '2024-01-01', '2024-01-15', '2024-02-19', '2024-03-29', '2024-05-27',
        '2024-06-19', '2024-07-04', '2024-09-02', '2024-11-28', '2024-12-25',
        # 2025
        '2025-01-01', '2025-01-20', '2025-02-17', '2025-04-18', '2025-05-26',
        '2025-06-19', '2025-07-04', '2025-09-01', '2025-11-27', '2025-12-25',
        # 2026
        '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25',
        '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25'
    ]
}
MARKET_HOLIDAYS['NASDAQ'] = MARKET_HOLIDAYS['NYSE']

def is_market_open(symbol=None, market=None):
    """
    Check if the market is currently open for trading
    
    Args:
        symbol (str, optional): Stock symbol to check
        market (str, optional): Market identifier ('NSE', 'NYSE', etc.)
    
    Returns:
        dict: {
            'is_open': bool,
            'market': str,
            'current_time': str,
            'next_open': str (if closed),
            'message': str
        }
    """
    # Determine market
    if market is None and symbol:
        market = get_market_for_symbol(symbol)
    elif market is None:
        market = 'NYSE'  # Default to NYSE
    
    if market not in MARKET_HOURS:
        return {
            'is_open': True,  # Unknown market, assume open
            'market': market,
            'message': 'Market hours unknown for this exchange'
        }
    
    market_config = MARKET_HOURS[market]
    
    # Get current time in market timezone
    tz = pytz.timezone(market_config['timezone'])
    now = datetime.now(tz)
    current_time = now.time()
    current_day = now.weekday()  # 0 = Monday, 6 = Sunday
    current_date_str = now.strftime('%Y-%m-%d')
    
    # Check if it's a holiday
    if market in MARKET_HOLIDAYS and current_date_str in MARKET_HOLIDAYS[market]:
        next_open_day = _get_next_trading_day(now, market_config)
        return {
            'is_open': False,
            'market': market,
            'current_time': now.isoformat(),
            'message': f'{market} is closed for a public holiday',
            'next_open': next_open_day.isoformat()
        }

    # Check if it's a trading day (weekend check)
    if current_day not in market_config['trading_days']:
        next_open_day = _get_next_trading_day(now, market_config)
        return {
            'is_open': False,
            'market': market,
            'current_time': now.isoformat(),
            'message': f'{market} is closed on weekends',
            'next_open': next_open_day.isoformat()
        }
    
    # Check if current time is within trading hours
    is_open = market_config['open_time'] <= current_time <= market_config['close_time']
    
    if is_open:
        close_time = now.replace(
            hour=market_config['close_time'].hour,
            minute=market_config['close_time'].minute,
            second=0,
            microsecond=0
        )
        return {
            'is_open': True,
            'market': market,
            'current_time': now.isoformat(),
            'closes_at': close_time.strftime('%H:%M %Z'),
            'message': f'{market} is currently open for trading'
        }
    else:
        # Market is closed
        if current_time < market_config['open_time']:
            # Before market open today
            open_time = now.replace(
                hour=market_config['open_time'].hour,
                minute=market_config['open_time'].minute,
                second=0,
                microsecond=0
            )
            next_open = open_time
        else:
            # After market close today, next open is tomorrow
            next_open = _get_next_trading_day(now, market_config)
        
        return {
            'is_open': False,
            'market': market,
            'current_time': now.isoformat(),
            'next_open': next_open.isoformat(),
            'message': f'{market} is currently closed. Opens at {market_config["open_time"].strftime("%H:%M")} {market_config["timezone"]}'
        }

def _get_next_trading_day(current_dt, market_config):
    """
    Get the next trading day open time
    
    Args:
        current_dt (datetime): Current datetime in market timezone
        market_config (dict): Market configuration
    
    Returns:
        datetime: Next market open datetime
    """
    next_dt = current_dt
    
    # Move to next day
    from datetime import timedelta
    next_dt = next_dt + timedelta(days=1)
    
    # Find next trading day
    while next_dt.weekday() not in market_config['trading_days'] or \
          (next_dt.strftime('%Y-%m-%d') in MARKET_HOLIDAYS.get(get_market_for_symbol_by_config(market_config), [])):
        next_dt = next_dt + timedelta(days=1)
    
    # Set to market open time
    next_dt = next_dt.replace(
        hour=market_config['open_time'].hour,
        minute=market_config['open_time'].minute,
        second=0,
        microsecond=0
    )
    
    return next_dt

def get_market_for_symbol_by_config(market_config):
    """Helper to find market key by config object"""
    for market, config in MARKET_HOURS.items():
        if config == market_config:
            return market
    return None

def get_market_status_message(symbol):
    """
    Get a user-friendly market status message
    
    Args:
        symbol (str): Stock symbol
    
    Returns:
        str: Status message
    """
    status = is_market_open(symbol=symbol)
    return status.get('message', 'Market status unknown')
