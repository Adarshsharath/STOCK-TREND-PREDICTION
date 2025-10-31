import pandas as pd
import numpy as np

def calculate_vwap(df):
    """Calculate Volume Weighted Average Price"""
    
    # Typical Price
    typical_price = (df['high'] + df['low'] + df['close']) / 3
    
    # VWAP = Cumulative(Typical Price * Volume) / Cumulative(Volume)
    # Reset daily for intraday (or use full period for daily data)
    df['tp_volume'] = typical_price * df['volume']
    
    vwap = df['tp_volume'].cumsum() / df['volume'].cumsum()
    
    return vwap

def calculate_vwap_bands(vwap, df, std_mult=2):
    """Calculate VWAP standard deviation bands"""
    
    typical_price = (df['high'] + df['low'] + df['close']) / 3
    
    # Calculate squared differences from VWAP
    variance = ((typical_price - vwap) ** 2 * df['volume']).cumsum() / df['volume'].cumsum()
    std_dev = np.sqrt(variance)
    
    upper_band = vwap + (std_dev * std_mult)
    lower_band = vwap - (std_dev * std_mult)
    
    return upper_band, lower_band

def vwap_strategy(df, use_bands=True, std_mult=2):
    """
    VWAP Strategy
    
    Buy Signal: 
    - Price crosses above VWAP (bullish)
    - Price bounces from lower VWAP band
    
    Sell Signal:
    - Price crosses below VWAP (bearish)
    - Price rejects from upper VWAP band
    
    Args:
        df: DataFrame with stock data
        use_bands: Use VWAP bands (default: True)
        std_mult: Standard deviation multiplier for bands (default: 2)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate VWAP
    df['vwap'] = calculate_vwap(df)
    
    if use_bands:
        df['vwap_upper'], df['vwap_lower'] = calculate_vwap_bands(df['vwap'], df, std_mult)
    
    # Calculate previous values
    df['close_prev'] = df['close'].shift(1)
    df['vwap_prev'] = df['vwap'].shift(1)
    
    # Generate signals
    df['signal'] = 0
    
    # VWAP crossover signals
    vwap_buy = (df['close_prev'] <= df['vwap_prev']) & (df['close'] > df['vwap'])
    vwap_sell = (df['close_prev'] >= df['vwap_prev']) & (df['close'] < df['vwap'])
    
    df.loc[vwap_buy, 'signal'] = 1
    df.loc[vwap_sell, 'signal'] = -1
    
    if use_bands:
        # Band bounce signals
        lower_band_prev = df['vwap_lower'].shift(1)
        upper_band_prev = df['vwap_upper'].shift(1)
        
        # Buy: Price touches lower band and bounces back
        band_buy = (df['close_prev'] <= lower_band_prev) & (df['close'] > df['vwap_lower']) & (df['close'] < df['vwap'])
        
        # Sell: Price touches upper band and rejects
        band_sell = (df['close_prev'] >= upper_band_prev) & (df['close'] < df['vwap_upper']) & (df['close'] > df['vwap'])
        
        df.loc[band_buy & (df['signal'] == 0), 'signal'] = 1
        df.loc[band_sell & (df['signal'] == 0), 'signal'] = -1
        
        # Breakout signals
        breakout_buy = (df['close_prev'] < upper_band_prev) & (df['close'] > df['vwap_upper']) & (df['volume'] > df['volume'].rolling(20).mean())
        breakout_sell = (df['close_prev'] > lower_band_prev) & (df['close'] < df['vwap_lower']) & (df['volume'] > df['volume'].rolling(20).mean())
        
        df.loc[breakout_buy & (df['signal'] == 0), 'signal'] = 1
        df.loc[breakout_sell & (df['signal'] == 0), 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add VWAP position to signals
    buy_signals['vwap_distance'] = ((buy_signals['close'] - buy_signals['vwap']) / buy_signals['vwap'] * 100)
    sell_signals['vwap_distance'] = ((sell_signals['close'] - sell_signals['vwap']) / sell_signals['vwap'] * 100)
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'VWAP Strategy',
            'description': f'Volume Weighted Average Price strategy. Trades VWAP crossovers and band bounces (±{std_mult} std dev).',
            'parameters': {
                'use_bands': use_bands,
                'std_mult': std_mult
            }
        }
    }
