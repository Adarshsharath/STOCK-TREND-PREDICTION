import pandas as pd
import numpy as np

def calculate_macd(data, fast=12, slow=26, signal=9):
    """Calculate MACD, Signal line, and Histogram"""
    ema_fast = data.ewm(span=fast, adjust=False).mean()
    ema_slow = data.ewm(span=slow, adjust=False).mean()
    
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    
    return macd_line, signal_line, histogram

def macd_strategy(df, fast=12, slow=26, signal=9):
    """
    MACD Strategy
    
    Buy Signal: When MACD line crosses above signal line
    Sell Signal: When MACD line crosses below signal line
    
    Args:
        df: DataFrame with stock data
        fast: Fast EMA period (default: 12)
        slow: Slow EMA period (default: 26)
        signal: Signal line period (default: 9)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate MACD
    df['macd'], df['signal_line'], df['histogram'] = calculate_macd(df['close'], fast, slow, signal)
    
    # Generate signals
    df['signal'] = 0
    df.loc[df['macd'] > df['signal_line'], 'signal'] = 1  # Buy
    df.loc[df['macd'] < df['signal_line'], 'signal'] = -1  # Sell
    
    # Detect crossovers
    df['position'] = df['signal'].diff()
    
    # Extract buy and sell points
    buy_signals = df[df['position'] == 2].copy()
    sell_signals = df[df['position'] == -2].copy()
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'MACD Strategy',
            'description': f'Moving Average Convergence Divergence strategy using {fast}/{slow}/{signal} periods. Buy when MACD crosses above signal line, sell when it crosses below.',
            'parameters': {
                'fast': fast,
                'slow': slow,
                'signal': signal
            }
        }
    }
