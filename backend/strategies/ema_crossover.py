import pandas as pd
import numpy as np
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.confidence_calculator import calculate_signal_confidence

def calculate_ema(data, period):
    """Calculate Exponential Moving Average"""
    return data.ewm(span=period, adjust=False).mean()

def ema_crossover_strategy(df, short_period=9, long_period=21):
    """
    EMA Crossover Strategy
    
    Buy Signal: When short EMA crosses above long EMA
    Sell Signal: When short EMA crosses below long EMA
    
    Args:
        df: DataFrame with stock data
        short_period: Short EMA period (default: 9)
        long_period: Long EMA period (default: 21)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate EMAs
    df['ema_short'] = calculate_ema(df['close'], short_period)
    df['ema_long'] = calculate_ema(df['close'], long_period)
    
    # Calculate EMA difference for better signal detection
    df['ema_diff'] = df['ema_short'] - df['ema_long']
    df['ema_diff_prev'] = df['ema_diff'].shift(1)
    
    # Generate signals - detect actual crossovers
    df['signal'] = 0
    
    # Buy signal: Short EMA crosses above Long EMA (was below, now above)
    buy_condition = (df['ema_diff_prev'] <= 0) & (df['ema_diff'] > 0)
    df.loc[buy_condition, 'signal'] = 1
    
    # Sell signal: Short EMA crosses below Long EMA (was above, now below)
    sell_condition = (df['ema_diff_prev'] >= 0) & (df['ema_diff'] < 0)
    df.loc[sell_condition, 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add momentum strength to signals
    for idx in buy_signals.index:
        if idx in df.index:
            df.at[idx, 'signal_strength'] = abs(df.at[idx, 'ema_diff']) / df.at[idx, 'close'] * 100
    
    for idx in sell_signals.index:
        if idx in df.index:
            df.at[idx, 'signal_strength'] = abs(df.at[idx, 'ema_diff']) / df.at[idx, 'close'] * 100
    
    # Add confidence scores
    buy_list = buy_signals[['date', 'close']].to_dict('records')
    sell_list = sell_signals[['date', 'close']].to_dict('records')
    buy_list, sell_list = calculate_signal_confidence(df, buy_list, sell_list, 'ema_crossover')
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_list,
        'sell_signals': sell_list,
        'metadata': {
            'name': 'EMA Crossover',
            'description': f'Exponential Moving Average crossover strategy using {short_period}-period and {long_period}-period EMAs. Buy when short EMA crosses above long EMA, sell when it crosses below.',
            'parameters': {
                'short_period': short_period,
                'long_period': long_period
            }
        }
    }
