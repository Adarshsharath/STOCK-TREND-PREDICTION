import pandas as pd
import numpy as np

def calculate_atr(df, period=10):
    """Calculate Average True Range"""
    high_low = df['high'] - df['low']
    high_close = np.abs(df['high'] - df['close'].shift())
    low_close = np.abs(df['low'] - df['close'].shift())
    
    ranges = pd.concat([high_low, high_close, low_close], axis=1)
    true_range = np.max(ranges, axis=1)
    atr = true_range.rolling(period).mean()
    
    return atr

def calculate_supertrend(df, period=10, multiplier=3):
    """Calculate SuperTrend indicator"""
    hl_avg = (df['high'] + df['low']) / 2
    atr = calculate_atr(df, period)
    
    upper_band = hl_avg + (multiplier * atr)
    lower_band = hl_avg - (multiplier * atr)
    
    supertrend = pd.Series(index=df.index, dtype=float)
    direction = pd.Series(index=df.index, dtype=int)
    
    for i in range(period, len(df)):
        if i == period:
            supertrend.iloc[i] = lower_band.iloc[i]
            direction.iloc[i] = 1
        else:
            if df['close'].iloc[i] > supertrend.iloc[i-1]:
                supertrend.iloc[i] = lower_band.iloc[i]
                direction.iloc[i] = 1
            elif df['close'].iloc[i] < supertrend.iloc[i-1]:
                supertrend.iloc[i] = upper_band.iloc[i]
                direction.iloc[i] = -1
            else:
                supertrend.iloc[i] = supertrend.iloc[i-1]
                direction.iloc[i] = direction.iloc[i-1]
    
    return supertrend, direction

def supertrend_strategy(df, period=10, multiplier=3):
    """
    SuperTrend Strategy
    
    Buy Signal: When price crosses above SuperTrend line
    Sell Signal: When price crosses below SuperTrend line
    
    Args:
        df: DataFrame with stock data
        period: ATR period (default: 10)
        multiplier: ATR multiplier (default: 3)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate SuperTrend
    df['supertrend'], df['direction'] = calculate_supertrend(df, period, multiplier)
    
    # Generate signals
    df['signal'] = df['direction']
    
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
            'name': 'SuperTrend',
            'description': f'SuperTrend indicator strategy using {period}-period ATR and {multiplier}x multiplier. Buy when price crosses above SuperTrend, sell when it crosses below.',
            'parameters': {
                'period': period,
                'multiplier': multiplier
            }
        }
    }
