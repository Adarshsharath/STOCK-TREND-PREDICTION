import pandas as pd
import numpy as np

def calculate_bollinger_bands(data, period=20, std_dev=2):
    """Calculate Bollinger Bands"""
    sma = data.rolling(window=period).mean()
    std = data.rolling(window=period).std()
    
    upper_band = sma + (std * std_dev)
    lower_band = sma - (std * std_dev)
    
    return sma, upper_band, lower_band

def bollinger_scalping_strategy(df, period=20, std_dev=2):
    """
    Bollinger Bands Scalping Strategy
    
    Buy Signal: When price touches or crosses below lower band
    Sell Signal: When price touches or crosses above upper band
    
    Args:
        df: DataFrame with stock data
        period: Moving average period (default: 20)
        std_dev: Standard deviation multiplier (default: 2)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate Bollinger Bands
    df['sma'], df['upper_band'], df['lower_band'] = calculate_bollinger_bands(df['close'], period, std_dev)
    
    # Generate signals
    df['signal'] = 0
    df.loc[df['close'] <= df['lower_band'], 'signal'] = 1  # Buy (price at lower band)
    df.loc[df['close'] >= df['upper_band'], 'signal'] = -1  # Sell (price at upper band)
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'Bollinger Scalping',
            'description': f'Bollinger Bands scalping strategy using {period}-period SMA and {std_dev} standard deviations. Buy when price touches lower band, sell when price touches upper band.',
            'parameters': {
                'period': period,
                'std_dev': std_dev
            }
        }
    }
