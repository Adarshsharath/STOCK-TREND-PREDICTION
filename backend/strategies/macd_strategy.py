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
    
    # Ensure date is a column, not index
    if 'date' not in df.columns and df.index.name == 'date':
        df.reset_index(inplace=True)
    elif 'date' not in df.columns:
        df['date'] = df.index
    
    # Calculate MACD
    df['macd'], df['signal_line'], df['histogram'] = calculate_macd(df['close'], fast, slow, signal)
    
    # Calculate previous values for crossover detection
    df['macd_prev'] = df['macd'].shift(1)
    df['signal_prev'] = df['signal_line'].shift(1)
    df['histogram_prev'] = df['histogram'].shift(1)
    
    # Generate signals - detect actual crossovers
    df['signal'] = 0
    
    # Buy signal: MACD crosses above signal line
    buy_condition = (df['macd_prev'] <= df['signal_prev']) & (df['macd'] > df['signal_line'])
    df.loc[buy_condition, 'signal'] = 1
    
    # Sell signal: MACD crosses below signal line  
    sell_condition = (df['macd_prev'] >= df['signal_prev']) & (df['macd'] < df['signal_line'])
    df.loc[sell_condition, 'signal'] = -1
    
    # Also detect histogram zero-line crossovers for additional signals
    histogram_buy = (df['histogram_prev'] <= 0) & (df['histogram'] > 0)
    histogram_sell = (df['histogram_prev'] >= 0) & (df['histogram'] < 0)
    
    # Add histogram signals (but don't override existing signals)
    df.loc[histogram_buy & (df['signal'] == 0), 'signal'] = 1
    df.loc[histogram_sell & (df['signal'] == 0), 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add MACD strength to signals
    buy_signals['macd_strength'] = buy_signals['histogram']
    sell_signals['macd_strength'] = sell_signals['histogram']
    
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
