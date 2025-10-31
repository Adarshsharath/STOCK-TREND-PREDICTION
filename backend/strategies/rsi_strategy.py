import pandas as pd
import numpy as np

def calculate_rsi(data, period=14):
    """Calculate Relative Strength Index"""
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def rsi_strategy(df, period=14, oversold=30, overbought=70):
    """
    RSI Strategy
    
    Buy Signal: When RSI crosses above oversold level (default: 30)
    Sell Signal: When RSI crosses below overbought level (default: 70)
    
    Args:
        df: DataFrame with stock data
        period: RSI period (default: 14)
        oversold: Oversold threshold (default: 30)
        overbought: Overbought threshold (default: 70)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate RSI
    df['rsi'] = calculate_rsi(df['close'], period)
    
    # Generate signals
    df['signal'] = 0
    df.loc[df['rsi'] < oversold, 'signal'] = 1  # Buy (oversold)
    df.loc[df['rsi'] > overbought, 'signal'] = -1  # Sell (overbought)
    
    # Detect crossovers (when signal changes from 0 to 1 or 0 to -1)
    df['position'] = df['signal'].diff()
    
    # Extract buy and sell crossover points only
    buy_signals = df[df['position'] == 1].copy()  # Changed from == 1 to detect entry
    sell_signals = df[df['position'] == -1].copy()  # Changed from == -1 to detect entry
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'RSI Strategy',
            'description': f'Relative Strength Index strategy with {period}-period RSI. Buy when RSI is below {oversold} (oversold), sell when RSI is above {overbought} (overbought).',
            'parameters': {
                'period': period,
                'oversold': oversold,
                'overbought': overbought
            }
        }
    }
