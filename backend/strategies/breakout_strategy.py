import pandas as pd
import numpy as np

def calculate_support_resistance(df, period=20):
    """Calculate support and resistance levels"""
    
    resistance = df['high'].rolling(window=period).max()
    support = df['low'].rolling(window=period).min()
    
    return support, resistance

def breakout_strategy(df, period=20, volume_confirm=True, volume_mult=1.5):
    """
    Breakout Strategy
    
    Buy Signal: 
    - Price breaks above recent high
    - Volume confirmation (optional)
    
    Sell Signal:
    - Price breaks below recent low
    - Volume confirmation (optional)
    
    Args:
        df: DataFrame with stock data
        period: Lookback period for high/low (default: 20)
        volume_confirm: Require volume confirmation (default: True)
        volume_mult: Volume multiplier for confirmation (default: 1.5)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate support and resistance
    df['support'], df['resistance'] = calculate_support_resistance(df, period)
    
    # Calculate average volume
    df['avg_volume'] = df['volume'].rolling(window=period).mean()
    
    # Calculate previous values
    df['high_prev'] = df['high'].shift(1)
    df['low_prev'] = df['low'].shift(1)
    df['close_prev'] = df['close'].shift(1)
    df['resistance_prev'] = df['resistance'].shift(1)
    df['support_prev'] = df['support'].shift(1)
    
    # Generate signals
    df['signal'] = 0
    
    # Breakout above resistance
    breakout_up = (df['close_prev'] <= df['resistance_prev']) & (df['close'] > df['resistance'])
    
    # Breakdown below support
    breakout_down = (df['close_prev'] >= df['support_prev']) & (df['close'] < df['support'])
    
    if volume_confirm:
        # Add volume confirmation
        volume_confirmed = df['volume'] > (df['avg_volume'] * volume_mult)
        
        df.loc[breakout_up & volume_confirmed, 'signal'] = 1
        df.loc[breakout_down & volume_confirmed, 'signal'] = -1
        
        # Moderate volume signals
        moderate_volume = (df['volume'] > df['avg_volume']) & (df['volume'] <= df['avg_volume'] * volume_mult)
        df.loc[breakout_up & moderate_volume & (df['signal'] == 0), 'signal'] = 1
        df.loc[breakout_down & moderate_volume & (df['signal'] == 0), 'signal'] = -1
    else:
        df.loc[breakout_up, 'signal'] = 1
        df.loc[breakout_down, 'signal'] = -1
    
    # Retest signals (price pulls back to breakout level)
    retest_buy = (df['close_prev'] > df['resistance_prev']) & (df['low'] <= df['resistance']) & (df['close'] > df['resistance'])
    retest_sell = (df['close_prev'] < df['support_prev']) & (df['high'] >= df['support']) & (df['close'] < df['support'])
    
    df.loc[retest_buy & (df['signal'] == 0), 'signal'] = 1
    df.loc[retest_sell & (df['signal'] == 0), 'signal'] = -1
    
    # Range expansion signals (volatility increase)
    df['range'] = df['high'] - df['low']
    df['avg_range'] = df['range'].rolling(window=period).mean()
    
    expansion = df['range'] > (df['avg_range'] * 1.5)
    expansion_buy = breakout_up & expansion
    expansion_sell = breakout_down & expansion
    
    df.loc[expansion_buy & (df['signal'] == 0), 'signal'] = 1
    df.loc[expansion_sell & (df['signal'] == 0), 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add breakout strength to signals
    buy_signals['breakout_strength'] = ((buy_signals['close'] - buy_signals['resistance']) / 
                                        buy_signals['resistance'] * 100)
    sell_signals['breakout_strength'] = ((buy_signals['support'] - sell_signals['close']) / 
                                         sell_signals['support'] * 100)
    
    # Add volume ratio
    buy_signals['volume_ratio'] = buy_signals['volume'] / buy_signals['avg_volume']
    sell_signals['volume_ratio'] = sell_signals['volume'] / sell_signals['avg_volume']
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'Breakout Strategy',
            'description': f'Breakout strategy using {period}-period high/low. Volume confirmation: {volume_confirm} ({volume_mult}x avg).',
            'parameters': {
                'period': period,
                'volume_confirm': volume_confirm,
                'volume_mult': volume_mult
            }
        }
    }
