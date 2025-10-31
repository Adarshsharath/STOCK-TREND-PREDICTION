import pandas as pd
import numpy as np

def calculate_adx_dmi(df, period=14):
    """Calculate ADX and DMI indicators"""
    
    # Calculate True Range
    df['high_low'] = df['high'] - df['low']
    df['high_close'] = np.abs(df['high'] - df['close'].shift(1))
    df['low_close'] = np.abs(df['low'] - df['close'].shift(1))
    df['true_range'] = df[['high_low', 'high_close', 'low_close']].max(axis=1)
    
    # Calculate Directional Movement
    df['up_move'] = df['high'] - df['high'].shift(1)
    df['down_move'] = df['low'].shift(1) - df['low']
    
    # Positive and Negative Directional Movement
    df['plus_dm'] = np.where((df['up_move'] > df['down_move']) & (df['up_move'] > 0), df['up_move'], 0)
    df['minus_dm'] = np.where((df['down_move'] > df['up_move']) & (df['down_move'] > 0), df['down_move'], 0)
    
    # Smooth the values
    atr = df['true_range'].rolling(window=period).mean()
    plus_di = 100 * (df['plus_dm'].rolling(window=period).mean() / atr)
    minus_di = 100 * (df['minus_dm'].rolling(window=period).mean() / atr)
    
    # Calculate DX and ADX
    dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di)
    adx = dx.rolling(window=period).mean()
    
    return adx, plus_di, minus_di

def adx_dmi_strategy(df, period=14, adx_threshold=25):
    """
    ADX + DMI Strategy
    
    Buy Signal: +DI crosses above -DI with ADX > threshold
    Sell Signal: -DI crosses above +DI with ADX > threshold
    
    Args:
        df: DataFrame with stock data
        period: ADX/DMI period (default: 14)
        adx_threshold: Minimum ADX for strong trend (default: 25)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate ADX and DMI
    df['adx'], df['plus_di'], df['minus_di'] = calculate_adx_dmi(df, period)
    
    # Calculate previous values for crossover detection
    df['plus_di_prev'] = df['plus_di'].shift(1)
    df['minus_di_prev'] = df['minus_di'].shift(1)
    df['adx_prev'] = df['adx'].shift(1)
    
    # Generate signals
    df['signal'] = 0
    
    # Buy signal: +DI crosses above -DI
    di_buy = (df['plus_di_prev'] <= df['minus_di_prev']) & (df['plus_di'] > df['minus_di'])
    
    # Sell signal: -DI crosses above +DI
    di_sell = (df['minus_di_prev'] <= df['plus_di_prev']) & (df['minus_di'] > df['plus_di'])
    
    # Strong signals (with ADX confirmation)
    strong_buy = di_buy & (df['adx'] > adx_threshold)
    strong_sell = di_sell & (df['adx'] > adx_threshold)
    
    df.loc[strong_buy, 'signal'] = 1
    df.loc[strong_sell, 'signal'] = -1
    
    # Moderate signals (ADX between 20-25)
    moderate_buy = di_buy & (df['adx'] >= 20) & (df['adx'] <= adx_threshold) & (df['signal'] == 0)
    moderate_sell = di_sell & (df['adx'] >= 20) & (df['adx'] <= adx_threshold) & (df['signal'] == 0)
    
    df.loc[moderate_buy, 'signal'] = 1
    df.loc[moderate_sell, 'signal'] = -1
    
    # ADX rising signals (increasing trend strength)
    adx_rising = df['adx'] > df['adx_prev']
    rising_buy = di_buy & adx_rising & (df['signal'] == 0)
    rising_sell = di_sell & adx_rising & (df['signal'] == 0)
    
    df.loc[rising_buy, 'signal'] = 1
    df.loc[rising_sell, 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add ADX strength to signals
    buy_signals['adx_strength'] = buy_signals['adx']
    sell_signals['adx_strength'] = sell_signals['adx']
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'ADX + DMI',
            'description': f'ADX and DMI strategy with {period}-period. Trades DMI crossovers when ADX > {adx_threshold} (strong trend).',
            'parameters': {
                'period': period,
                'adx_threshold': adx_threshold
            }
        }
    }
