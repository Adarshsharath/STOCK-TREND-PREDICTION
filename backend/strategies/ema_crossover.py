import pandas as pd
import numpy as np

def calculate_ema(data, period):
    """Calculate Exponential Moving Average"""
    return data.ewm(span=period, adjust=False).mean()

def ema_crossover_strategy(df, short_period=12, long_period=26):
    """
    EMA Crossover Strategy
    
    Buy Signal: When short EMA crosses above long EMA
    Sell Signal: When short EMA crosses below long EMA
    
    Args:
        df: DataFrame with stock data
        short_period: Short EMA period (default: 12)
        long_period: Long EMA period (default: 26)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate EMAs
    df['ema_short'] = calculate_ema(df['close'], short_period)
    df['ema_long'] = calculate_ema(df['close'], long_period)
    
    # Generate signals
    df['signal'] = 0
    df.loc[df['ema_short'] > df['ema_long'], 'signal'] = 1  # Buy
    df.loc[df['ema_short'] < df['ema_long'], 'signal'] = -1  # Sell
    
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
            'name': 'EMA Crossover',
            'description': f'Exponential Moving Average crossover strategy using {short_period}-period and {long_period}-period EMAs. Buy when short EMA crosses above long EMA, sell when it crosses below.',
            'parameters': {
                'short_period': short_period,
                'long_period': long_period
            }
        }
    }
