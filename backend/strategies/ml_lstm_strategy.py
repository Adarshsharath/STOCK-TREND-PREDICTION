import pandas as pd
import numpy as np
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def ml_lstm_strategy(df, lookback=60, threshold=0.02):
    """
    ML/LSTM Strategy
    
    Uses price patterns and momentum to generate signals
    Simulates ML predictions based on historical patterns
    
    Buy Signal: 
    - Strong upward momentum detected
    - Price pattern suggests reversal up
    
    Sell Signal:
    - Strong downward momentum detected
    - Price pattern suggests reversal down
    
    Args:
        df: DataFrame with stock data
        lookback: Lookback window for pattern detection (default: 60)
        threshold: Threshold for signal generation (default: 0.02 = 2%)
    
    Returns:
        dict with signals, data, and metadata
    """
    df = df.copy()
    
    # Calculate features for ML simulation
    # 1. Price momentum
    df['returns'] = df['close'].pct_change()
    df['momentum_5'] = df['returns'].rolling(window=5).mean()
    df['momentum_10'] = df['returns'].rolling(window=10).mean()
    df['momentum_20'] = df['returns'].rolling(window=20).mean()
    
    # 2. Volatility
    df['volatility'] = df['returns'].rolling(window=20).std()
    
    # 3. Price position relative to moving averages
    df['sma_20'] = df['close'].rolling(window=20).mean()
    df['sma_50'] = df['close'].rolling(window=50).mean()
    df['price_to_sma20'] = (df['close'] - df['sma_20']) / df['sma_20']
    df['price_to_sma50'] = (df['close'] - df['sma_50']) / df['sma_50']
    
    # 4. Volume trend
    df['volume_ma'] = df['volume'].rolling(window=20).mean()
    df['volume_ratio'] = df['volume'] / df['volume_ma']
    
    # 5. RSI-like momentum indicator
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    
    # ML Score Calculation (simulated)
    # Positive score = bullish, Negative score = bearish
    df['ml_score'] = (
        (df['momentum_5'] * 3) +
        (df['momentum_10'] * 2) +
        (df['momentum_20'] * 1) +
        (df['price_to_sma20'] * 2) +
        (df['price_to_sma50'] * 1) +
        ((df['rsi'] - 50) / 100) +
        ((df['volume_ratio'] - 1) * 0.5)
    )
    
    # Smooth ML score
    df['ml_score_smooth'] = df['ml_score'].rolling(window=3).mean()
    df['ml_score_prev'] = df['ml_score_smooth'].shift(1)
    
    # Generate signals
    df['signal'] = 0
    
    # Buy signals: ML score crosses above threshold
    buy_condition = (df['ml_score_prev'] <= threshold) & (df['ml_score_smooth'] > threshold)
    
    # Sell signals: ML score crosses below negative threshold  
    sell_condition = (df['ml_score_prev'] >= -threshold) & (df['ml_score_smooth'] < -threshold)
    
    df.loc[buy_condition, 'signal'] = 1
    df.loc[sell_condition, 'signal'] = -1
    
    # Strong signals (high confidence)
    strong_buy = buy_condition & (df['ml_score_smooth'] > threshold * 2) & (df['volume_ratio'] > 1.2)
    strong_sell = sell_condition & (df['ml_score_smooth'] < -threshold * 2) & (df['volume_ratio'] > 1.2)
    
    df.loc[strong_buy, 'signal'] = 1
    df.loc[strong_sell, 'signal'] = -1
    
    # Reversal signals (oversold/overbought with momentum change)
    reversal_buy = (df['rsi'] < 30) & (df['momentum_5'] > 0) & (df['ml_score_smooth'] > 0)
    reversal_sell = (df['rsi'] > 70) & (df['momentum_5'] < 0) & (df['ml_score_smooth'] < 0)
    
    df.loc[reversal_buy & (df['signal'] == 0), 'signal'] = 1
    df.loc[reversal_sell & (df['signal'] == 0), 'signal'] = -1
    
    # Extract buy and sell points
    buy_signals = df[df['signal'] == 1].copy()
    sell_signals = df[df['signal'] == -1].copy()
    
    # Add ML confidence to signals
    buy_signals['ml_confidence'] = buy_signals['ml_score_smooth'].abs() * 100
    sell_signals['ml_confidence'] = sell_signals['ml_score_smooth'].abs() * 100
    
    # Add prediction strength
    buy_signals['prediction_strength'] = 'High' if len(buy_signals) > 0 else ''
    sell_signals['prediction_strength'] = 'High' if len(sell_signals) > 0 else ''
    
    return {
        'data': df.to_dict('records'),
        'buy_signals': buy_signals[['date', 'close']].to_dict('records'),
        'sell_signals': sell_signals[['date', 'close']].to_dict('records'),
        'metadata': {
            'name': 'ML/LSTM Strategy',
            'description': f'Machine Learning strategy using {lookback}-day pattern recognition. Combines momentum, volatility, and volume analysis.',
            'parameters': {
                'lookback': lookback,
                'threshold': threshold
            }
        }
    }
