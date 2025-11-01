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

def rsi_strategy(df, period=14, oversold=35, overbought=65):
    """
    RSI Strategy
    
    Buy Signal: When RSI crosses above oversold level (default: 35)
    Sell Signal: When RSI crosses below overbought level (default: 65)
    
    Args:
        df: DataFrame with stock data
        period: RSI period (default: 14)
        oversold: Oversold threshold (default: 35)
        overbought: Overbought threshold (default: 65)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Ensure date is a column, not index
    if 'date' not in df.columns and df.index.name == 'date':
        df.reset_index(inplace=True)
    elif 'date' not in df.columns:
        df['date'] = df.index
    
    # Calculate RSI
    df['rsi'] = calculate_rsi(df['close'], period)
    df['rsi_prev'] = df['rsi'].shift(1)
    
    # Generate signals - detect crossovers
    df['signal'] = 0
    
    # Buy signal: RSI crosses above oversold threshold (was below, now above)
    buy_condition = (df['rsi_prev'] < oversold) & (df['rsi'] >= oversold)
    df.loc[buy_condition, 'signal'] = 1
    
    # Sell signal: RSI crosses below overbought threshold (was above, now below)  
    sell_condition = (df['rsi_prev'] > overbought) & (df['rsi'] <= overbought)
    df.loc[sell_condition, 'signal'] = -1
    
    # Also generate signals for extreme RSI values for better coverage
    extreme_buy = (df['rsi'] < 25) & (df['rsi_prev'] >= 25)  # Extreme oversold
    extreme_sell = (df['rsi'] > 75) & (df['rsi_prev'] <= 75)  # Extreme overbought
    
    df.loc[extreme_buy, 'signal'] = 1
    df.loc[extreme_sell, 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add RSI value to signals for context
    buy_signals['rsi_value'] = buy_signals['rsi']
    sell_signals['rsi_value'] = sell_signals['rsi']
    
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
