import pandas as pd
import numpy as np

def calculate_ichimoku(df, tenkan=9, kijun=26, senkou_b=52):
    """Calculate Ichimoku Cloud components"""
    
    # Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
    period_high = df['high'].rolling(window=tenkan).max()
    period_low = df['low'].rolling(window=tenkan).min()
    tenkan_sen = (period_high + period_low) / 2
    
    # Kijun-sen (Base Line): (26-period high + 26-period low) / 2
    period_high = df['high'].rolling(window=kijun).max()
    period_low = df['low'].rolling(window=kijun).min()
    kijun_sen = (period_high + period_low) / 2
    
    # Senkou Span A (Leading Span A): (Tenkan-sen + Kijun-sen) / 2
    senkou_span_a = ((tenkan_sen + kijun_sen) / 2).shift(kijun)
    
    # Senkou Span B (Leading Span B): (52-period high + 52-period low) / 2
    period_high = df['high'].rolling(window=senkou_b).max()
    period_low = df['low'].rolling(window=senkou_b).min()
    senkou_span_b = ((period_high + period_low) / 2).shift(kijun)
    
    # Chikou Span (Lagging Span): Current closing price shifted back 26 periods
    chikou_span = df['close'].shift(-kijun)
    
    return tenkan_sen, kijun_sen, senkou_span_a, senkou_span_b, chikou_span

def ichimoku_strategy(df, tenkan=9, kijun=26, senkou_b=52):
    """
    Ichimoku Cloud Strategy
    
    Buy Signal: 
    - Tenkan crosses above Kijun (TK cross)
    - Price above cloud
    - Chikou above price
    
    Sell Signal:
    - Tenkan crosses below Kijun
    - Price below cloud
    - Chikou below price
    
    Args:
        df: DataFrame with stock data
        tenkan: Tenkan period (default: 9)
        kijun: Kijun period (default: 26)
        senkou_b: Senkou B period (default: 52)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate Ichimoku components
    df['tenkan_sen'], df['kijun_sen'], df['senkou_a'], df['senkou_b'], df['chikou_span'] = calculate_ichimoku(df, tenkan, kijun, senkou_b)
    
    # Calculate cloud top and bottom
    df['cloud_top'] = df[['senkou_a', 'senkou_b']].max(axis=1)
    df['cloud_bottom'] = df[['senkou_a', 'senkou_b']].min(axis=1)
    
    # Calculate previous values for crossover detection
    df['tenkan_prev'] = df['tenkan_sen'].shift(1)
    df['kijun_prev'] = df['kijun_sen'].shift(1)
    df['close_prev'] = df['close'].shift(1)
    
    # Generate signals
    df['signal'] = 0
    
    # TK Cross signals
    tk_buy = (df['tenkan_prev'] <= df['kijun_prev']) & (df['tenkan_sen'] > df['kijun_sen'])
    tk_sell = (df['tenkan_prev'] >= df['kijun_prev']) & (df['tenkan_sen'] < df['kijun_sen'])
    
    # Cloud breakout signals
    cloud_buy = (df['close_prev'] <= df['cloud_top'].shift(1)) & (df['close'] > df['cloud_top'])
    cloud_sell = (df['close_prev'] >= df['cloud_bottom'].shift(1)) & (df['close'] < df['cloud_bottom'])
    
    # Strong buy: TK cross + price above cloud
    strong_buy = tk_buy & (df['close'] > df['cloud_top'])
    df.loc[strong_buy, 'signal'] = 1
    
    # Regular buy: TK cross or cloud breakout
    df.loc[(tk_buy | cloud_buy) & (df['signal'] == 0), 'signal'] = 1
    
    # Strong sell: TK cross + price below cloud
    strong_sell = tk_sell & (df['close'] < df['cloud_bottom'])
    df.loc[strong_sell, 'signal'] = -1
    
    # Regular sell: TK cross or cloud breakdown
    df.loc[(tk_sell | cloud_sell) & (df['signal'] == 0), 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add cloud position to signals
    buy_signals['cloud_position'] = 'above' if len(buy_signals) > 0 else ''
    sell_signals['cloud_position'] = 'below' if len(sell_signals) > 0 else ''
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'Ichimoku Cloud',
            'description': f'Ichimoku Cloud strategy with {tenkan}/{kijun}/{senkou_b} periods. Signals from TK crosses and cloud breakouts.',
            'parameters': {
                'tenkan': tenkan,
                'kijun': kijun,
                'senkou_b': senkou_b
            }
        }
    }
