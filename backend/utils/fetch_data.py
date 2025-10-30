import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

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
