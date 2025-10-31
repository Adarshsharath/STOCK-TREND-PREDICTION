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
    
    # Calculate band width for squeeze detection
    df['band_width'] = (df['upper_band'] - df['lower_band']) / df['sma']
    df['band_width_prev'] = df['band_width'].shift(1)
    
    # Calculate previous close for crossover detection
    df['close_prev'] = df['close'].shift(1)
    
    # Generate signals
    df['signal'] = 0
    
    # Buy signal: Price crosses below lower band (was above, now below or touching)
    buy_condition = (df['close_prev'] > df['lower_band'].shift(1)) & (df['close'] <= df['lower_band'])
    df.loc[buy_condition, 'signal'] = 1
    
    # Sell signal: Price crosses above upper band (was below, now above or touching)
    sell_condition = (df['close_prev'] < df['upper_band'].shift(1)) & (df['close'] >= df['upper_band'])
    df.loc[sell_condition, 'signal'] = -1
    
    # Additional signals: Mean reversion from bands back to SMA
    mean_reversion_buy = (df['close_prev'] <= df['lower_band'].shift(1)) & (df['close'] > df['lower_band']) & (df['close'] < df['sma'])
    mean_reversion_sell = (df['close_prev'] >= df['upper_band'].shift(1)) & (df['close'] < df['upper_band']) & (df['close'] > df['sma'])
    
    df.loc[mean_reversion_buy & (df['signal'] == 0), 'signal'] = 1
    df.loc[mean_reversion_sell & (df['signal'] == 0), 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add band position percentage to signals
    buy_signals['band_position'] = ((buy_signals['close'] - buy_signals['lower_band']) / 
                                     (buy_signals['upper_band'] - buy_signals['lower_band']) * 100)
    sell_signals['band_position'] = ((sell_signals['close'] - sell_signals['lower_band']) / 
                                      (sell_signals['upper_band'] - sell_signals['lower_band']) * 100)
    
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
