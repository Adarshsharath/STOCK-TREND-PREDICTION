import numpy as np
import pandas as pd

def calculate_signal_confidence(df, buy_signals, sell_signals, strategy_type='technical'):
    """
    Calculate confidence scores for buy/sell signals based on multiple factors

    Args:
        df: DataFrame with stock data and indicators
        buy_signals: List of buy signal dictionaries
        sell_signals: List of sell signal dictionaries
        strategy_type: Type of strategy being used
    
    Returns:
        Updated buy_signals and sell_signals with confidence scores
    """
    # Ensure positional indexing is safe for downstream iloc
    df = df.reset_index(drop=True).copy()
    
    # Add confidence to buy signals
    for signal in buy_signals:
        signal_date = signal.get('date')
        signal_row = df[df['date'] == signal_date]
        
        if not signal_row.empty:
            # Convert DataFrame index label to integer position for iloc-safe access
            idx_label = signal_row.index[0]
            try:
                if isinstance(idx_label, (int, np.integer)):
                    idx_pos = int(idx_label)
                else:
                    idx_pos = int(df.index.get_indexer([idx_label])[0])
            except Exception:
                # Fallback to first matching position
                idx_pos = int(signal_row.reset_index().index[0])

            confidence = calculate_single_signal_confidence(
                df, idx_pos, 'buy', strategy_type
            )
            signal['confidence'] = confidence['score']
            signal['confidence_label'] = confidence['label']
            signal['confidence_color'] = confidence['color']
            signal['factors'] = confidence['factors']
    
    # Add confidence to sell signals
    for signal in sell_signals:
        signal_date = signal.get('date')
        signal_row = df[df['date'] == signal_date]
        
        if not signal_row.empty:
            idx_label = signal_row.index[0]
            try:
                if isinstance(idx_label, (int, np.integer)):
                    idx_pos = int(idx_label)
                else:
                    idx_pos = int(df.index.get_indexer([idx_label])[0])
            except Exception:
                idx_pos = int(signal_row.reset_index().index[0])

            confidence = calculate_single_signal_confidence(
                df, idx_pos, 'sell', strategy_type
            )
            signal['confidence'] = confidence['score']
            signal['confidence_label'] = confidence['label']
            signal['confidence_color'] = confidence['color']
            signal['factors'] = confidence['factors']
    
    return buy_signals, sell_signals

def calculate_single_signal_confidence(df, idx, signal_type, strategy_type):
    """
    Calculate confidence for a single signal based on multiple factors
    """
    # Ensure idx is an integer positional index
    try:
        if isinstance(idx, (list, tuple, np.ndarray, pd.Series)):
            idx = int(idx[0])
        else:
            idx = int(idx)
    except Exception:
        idx = 0

    # Bound-check idx
    if idx < 0:
        idx = 0
    if idx >= len(df):
        idx = len(df) - 1 if len(df) > 0 else 0

    factors = {}
    scores = []
    
    # Factor 1: Volume confirmation (30% weight)
    if 'volume' in df.columns and len(df) > 0:
        avg_volume = df['volume'].rolling(window=20).mean().iloc[idx]
        current_volume = df['volume'].iloc[idx]
        if pd.notna(avg_volume) and avg_volume > 0:
            volume_ratio = current_volume / avg_volume
            volume_score = min(100, volume_ratio * 50)
            factors['volume'] = round(volume_score, 1)
            scores.append(volume_score * 0.3)
    
    # Factor 2: Price momentum (25% weight)
    if 'close' in df.columns and len(df) > 0:
        base_idx = max(0, idx-5)
        denom = df['close'].iloc[base_idx] if df['close'].iloc[base_idx] != 0 else np.nan
        price_change_5d = np.nan
        try:
            price_change_5d = ((df['close'].iloc[idx] - df['close'].iloc[base_idx]) / denom * 100) if pd.notna(denom) else 0
        except Exception:
            price_change_5d = 0
        
        if signal_type == 'buy':
            momentum_score = max(0, min(100, 50 + price_change_5d * 10))
        else:
            momentum_score = max(0, min(100, 50 - price_change_5d * 10))
        
        factors['momentum'] = round(momentum_score, 1)
        scores.append(momentum_score * 0.25)
    
    # Factor 3: Volatility (20% weight)
    if 'close' in df.columns and len(df) > 0:
        volatility = df['close'].rolling(window=10).std().iloc[idx]
        avg_volatility = df['close'].rolling(window=20).std().mean()
        if pd.notna(volatility) and pd.notna(avg_volatility) and avg_volatility > 0:
            volatility_ratio = volatility / avg_volatility
            # Lower volatility = higher confidence
            volatility_score = max(0, 100 - (volatility_ratio - 1) * 50)
            factors['volatility'] = round(volatility_score, 1)
            scores.append(volatility_score * 0.2)
    
    # Factor 4: Trend strength (25% weight)
    trend_score = calculate_trend_strength(df, idx, signal_type)
    factors['trend'] = round(trend_score, 1)
    scores.append(trend_score * 0.25)
    
    # Calculate overall confidence
    overall_confidence = sum(scores) if scores else 50
    overall_confidence = max(0, min(100, overall_confidence))
    
    # Classify confidence
    if overall_confidence >= 80:
        label = 'Very Strong'
        color = 'green'
    elif overall_confidence >= 65:
        label = 'Strong'
        color = 'lightgreen'
    elif overall_confidence >= 50:
        label = 'Moderate'
        color = 'yellow'
    elif overall_confidence >= 35:
        label = 'Weak'
        color = 'orange'
    else:
        label = 'Very Weak'
        color = 'red'
    
    return {
        'score': round(overall_confidence, 1),
        'label': label,
        'color': color,
        'factors': factors
    }

def calculate_trend_strength(df, idx, signal_type):
    """
    Calculate trend strength using price action
    """
    if 'close' not in df.columns or len(df) < idx + 10:
        return 50
    
    # Calculate moving averages if not present
    if 'sma_20' not in df.columns:
        df['sma_20'] = df['close'].rolling(window=20).mean()
    if 'sma_50' not in df.columns:
        df['sma_50'] = df['close'].rolling(window=50).mean()
    
    current_price = df['close'].iloc[idx]
    sma_20 = df['sma_20'].iloc[idx]
    sma_50 = df['sma_50'].iloc[idx] if len(df) > 50 else sma_20
    
    if pd.isna(sma_20) or pd.isna(sma_50):
        return 50
    
    if signal_type == 'buy':
        # For buy signals, prefer price above MAs
        if current_price > sma_20 > sma_50:
            return 90
        elif current_price > sma_20:
            return 70
        elif current_price > sma_50:
            return 55
        else:
            return 40
    else:
        # For sell signals, prefer price below MAs
        if current_price < sma_20 < sma_50:
            return 90
        elif current_price < sma_20:
            return 70
        elif current_price < sma_50:
            return 55
        else:
            return 40

def get_confidence_explanation():
    """
    Get explanation of confidence score calculation
    """
    return {
        'description': 'AI Confidence Score measures signal reliability',
        'factors': {
            'Volume Confirmation': {
                'weight': '30%',
                'description': 'Compares current volume to 20-day average'
            },
            'Price Momentum': {
                'weight': '25%',
                'description': '5-day price movement direction and strength'
            },
            'Volatility': {
                'weight': '20%',
                'description': 'Lower volatility increases confidence'
            },
            'Trend Strength': {
                'weight': '25%',
                'description': 'Alignment with moving averages'
            }
        },
        'scale': {
            'Very Strong': '80-100% - High probability signal',
            'Strong': '65-79% - Good probability signal',
            'Moderate': '50-64% - Average probability signal',
            'Weak': '35-49% - Low probability signal',
            'Very Weak': '0-34% - Very low probability signal'
        },
        'recommendation': 'Combine confidence scores with other analysis methods for best results'
    }
