import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import os


def _normalize_ohlcv_df(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize various OHLCV column naming schemes to: date, open, high, low, close, volume."""
    df = df.copy()

    # Flatten MultiIndex columns if present
    if isinstance(df.columns, pd.MultiIndex):
        # yfinance commonly returns MultiIndex columns like: ('Open','AAPL')
        # Prefer the level that contains OHLCV field names.
        lvl0 = [str(c[0]) for c in df.columns]
        lvl1 = [str(c[-1]) for c in df.columns]
        ohlcv_tokens = {'open', 'high', 'low', 'close', 'adj close', 'adj_close', 'volume'}
        lvl0_lc = {s.lower().strip() for s in lvl0}
        if len(lvl0_lc.intersection(ohlcv_tokens)) >= 3:
            df.columns = lvl0
        else:
            df.columns = lvl1

    df.columns = [str(c).strip() for c in df.columns]

    # Common rename map (case-insensitive)
    rename_map = {}
    for c in df.columns:
        lc = c.lower().replace(' ', '_')
        # Some sources may have an unnamed datetime column after reset_index
        if (c == '' or lc == 'unnamed:_0') and pd.api.types.is_datetime64_any_dtype(df[c]):
            rename_map[c] = 'date'
            continue
        if lc in ['datetime', 'date', 'timestamp', 'time']:
            rename_map[c] = 'date'
        elif lc in ['open']:
            rename_map[c] = 'open'
        elif lc in ['high']:
            rename_map[c] = 'high'
        elif lc in ['low']:
            rename_map[c] = 'low'
        elif lc in ['close']:
            rename_map[c] = 'close'
        elif lc in ['adj_close', 'adjclose', 'adjusted_close']:
            # Only use adjusted close if regular close isn't present
            rename_map[c] = 'adj_close'
        elif lc in ['volume', 'vol']:
            rename_map[c] = 'volume'

    df.rename(columns=rename_map, inplace=True)

    # Prefer close, else fall back to adj_close
    if 'close' not in df.columns and 'adj_close' in df.columns:
        df['close'] = df['adj_close']

    required = ['date', 'open', 'high', 'low', 'close']
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise Exception(f"Missing required OHLCV columns: {missing}. Got columns: {list(df.columns)}")

    if 'volume' not in df.columns:
        df['volume'] = 0.0

    df = df[['date', 'open', 'high', 'low', 'close', 'volume']]
    return df

def fetch_stock_data(symbol, period="1y", interval="1d"):
    """
    Fetch stock data using yfinance
    
    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL', 'INFY.NS')
        period: Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
    
    Returns:
        DataFrame with OHLCV data
    """
    try:
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period, interval=interval)
        
        if df.empty:
            raise ValueError(f"No data found for symbol: {symbol}")
        
        # Reset index to make Date a column
        df.reset_index(inplace=True)
        
        # Ensure column names are standardized
        df.columns = [col.lower().replace(' ', '_') for col in df.columns]
        
        return df
    
    except Exception as e:
        raise Exception(f"Error fetching data for {symbol}: {str(e)}")

def _fetch_intraday_yf(symbol, resolution='1', lookback_minutes=390):
    """Fetch intraday candles via yfinance."""
    interval_map = {
        '1': '1m',
        '5': '5m',
        '15': '15m',
        '30': '30m',
        '60': '60m'
    }
    interval = interval_map.get(resolution, '1m')

    # For intraday data, use Ticker.history() which provides more recent data
    # than yf.download() for intraday intervals
    ticker = yf.Ticker(symbol)
    
    # For intraday data, always use recent days to ensure we get the latest data
    # yfinance sometimes delays current day data with period='1d'
    if lookback_minutes <= 390:
        period = '5d'  # Use 5 days to ensure we get complete today's data
    elif lookback_minutes <= 5 * 390:
        period = '5d'
    else:
        period = '1mo'

    # Fetch using Ticker.history for better real-time data
    df = ticker.history(period=period, interval=interval, prepost=False)
    
    if df is None or df.empty:
        # Fallback to download method
        df = yf.download(symbol, period=period, interval=interval, progress=False, auto_adjust=False, prepost=False)
        if df is None or df.empty:
            raise Exception(f"yfinance returned no data for {symbol}")

    df = df.copy().reset_index()
    
    # Normalize columns using the common function
    df = _normalize_ohlcv_df(df)
    df = df.dropna()
    df = df.sort_values('date')
    
    # Filter to only the requested lookback period (from most recent)
    if len(df) > 0 and lookback_minutes:
        # Get the most recent timestamp
        latest_time = df['date'].max()
        # Calculate cutoff time
        cutoff_time = latest_time - pd.Timedelta(minutes=lookback_minutes)
        # Filter data
        df = df[df['date'] >= cutoff_time]
    
    # Mark data source for downstream consumers
    try:
        df.attrs['data_source'] = 'yfinance'
    except Exception:
        pass
    return df

def fetch_live_candles(symbol, resolution='1', lookback_minutes=390):
    """
    Fetch recent live OHLCV candles using yfinance.

    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL')
        resolution: Candle resolution in minutes. Supported: '1','5','15','30','60'
        lookback_minutes: How many minutes back from now to fetch

    Returns:
        DataFrame with columns: date, open, high, low, close, volume
    """
    return _fetch_intraday_yf(symbol, resolution=resolution, lookback_minutes=lookback_minutes)

def preprocess_data(df):
    """
    Preprocess stock data for ML models
    
    Args:
        df: DataFrame with stock data
    
    Returns:
        Preprocessed DataFrame
    """
    # Remove any NaN values
    df = df.dropna()
    
    # Sort by date
    if 'date' in df.columns:
        df = df.sort_values('date')
    
    return df

def calculate_returns(df, column='close'):
    """
    Calculate daily returns
    
    Args:
        df: DataFrame with stock data
        column: Column to calculate returns on
    
    Returns:
        DataFrame with returns column added
    """
    df['returns'] = df[column].pct_change()
    return df
