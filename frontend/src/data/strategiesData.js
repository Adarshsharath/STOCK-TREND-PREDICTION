export const strategiesData = [
  {
    id: 'ema-crossover',
    name: 'EMA Crossover',
    category: 'Trend Following',
    icon: '📈',
    color: 'from-blue-500 to-cyan-500',
    description: 'Exponential Moving Average crossover strategy for trend identification',
    idealTimeframes: ['3-5 min (Scalping)', '15-30 min (Intraday)', '1hr / 4hr / 1D (Swing)'],
    subStrategies: [
      { id: 'ema-5-20', name: '5 EMA & 20 EMA', description: 'Ultra-fast scalping setup. Generates frequent signals for day traders. Best on 3-5 min charts.', params: { fast: 5, slow: 20 } },
      { id: 'ema-9-21', name: '9 EMA & 21 EMA', description: 'Smooth intraday trend following. Filters out noise while staying responsive. Ideal for 15-30 min charts.', params: { fast: 9, slow: 21 } },
      { id: 'ema-20-50', name: '20 EMA & 50 EMA', description: 'Medium-term swing trading. Catches major trend changes with fewer false signals. Works on 1hr-4hr charts.', params: { fast: 20, slow: 50 } },
      { id: 'ema-50-200', name: '50 EMA & 200 EMA', description: 'Golden Cross/Death Cross strategy. Long-term position trading with high reliability. Use on daily charts.', params: { fast: 50, slow: 200 } }
    ],
    bonusTip: 'Add "EMA Ribbon" (set of 6 EMAs) to visually show momentum compression or expansion.'
  },
  {
    id: 'rsi',
    name: 'RSI Strategy',
    category: 'Momentum / Reversal',
    icon: '⚡',
    color: 'from-purple-500 to-pink-500',
    description: 'Relative Strength Index for identifying overbought and oversold conditions',
    idealTimeframes: ['5-15 min (Quick reversals)', '1hr / 4hr (Trend pullbacks)'],
    subStrategies: [
      { id: 'rsi-standard', name: 'Standard RSI (30/70)', description: 'Classic oversold/overbought levels. Buy when RSI < 30, sell when > 70. Best for ranging markets and quick reversals.', params: { period: 14, oversold: 30, overbought: 70 } },
      { id: 'rsi-aggressive', name: 'Aggressive RSI (20/80)', description: 'Stricter thresholds for extreme conditions. Fewer but higher quality signals. Use in strong trending markets.', params: { period: 14, oversold: 20, overbought: 80 } },
      { id: 'rsi-ema', name: 'RSI + EMA 9', description: 'Smoothed RSI with EMA overlay. Crossover signals for trend confirmation. Reduces false signals in choppy markets.', params: { period: 14, ema: 9 } },
      { id: 'rsi-divergence', name: 'RSI Divergence', description: 'Advanced strategy detecting price-RSI divergence. Early reversal signals. Requires experience to interpret correctly.', params: { period: 14 } }
    ],
    bonusTip: 'Add Stochastic RSI for more sensitive short-term moves.'
  },
  {
    id: 'macd',
    name: 'MACD',
    category: 'Momentum Confirmation',
    icon: '📊',
    color: 'from-green-500 to-teal-500',
    description: 'Moving Average Convergence Divergence for momentum confirmation',
    idealTimeframes: ['15-30 min (Intraday)', '1D (Swing)'],
    subStrategies: [
      { id: 'macd-standard', name: 'Standard MACD (12,26,9)', description: 'Industry-standard settings used by professionals. Reliable momentum signals. Works well on daily charts for swing trading.', params: { fast: 12, slow: 26, signal: 9 } },
      { id: 'macd-aggressive', name: 'Fast MACD (5,35,5)', description: 'More responsive to price changes. Generates earlier signals but more whipsaws. Best for short-term intraday trading.', params: { fast: 5, slow: 35, signal: 5 } },
      { id: 'macd-histogram', name: 'Histogram Crossover', description: 'Trades histogram zero-line crossovers. Confirms trend strength. Fewer signals but higher accuracy.', params: { fast: 12, slow: 26, signal: 9 } },
      { id: 'macd-rsi', name: 'MACD + RSI Combo', description: 'Double confirmation system. Both indicators must align for signal. Reduces false positives significantly.', params: { fast: 12, slow: 26, signal: 9, rsi: 14 } }
    ],
    bonusTip: 'Watch MACD histogram slope to detect weakening trends early.'
  },
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    category: 'Volatility Breakout',
    icon: '🎯',
    color: 'from-orange-500 to-red-500',
    description: 'Volatility-based trading using standard deviation bands',
    idealTimeframes: ['5 min (Scalping)', '15-60 min (Intraday)'],
    subStrategies: [
      { id: 'bb-standard', name: 'Standard BB (20,2)', description: 'Classic 2 standard deviation bands. Price touching bands signals overbought/oversold. Works in all market conditions.', params: { period: 20, std: 2 } },
      { id: 'bb-tight', name: 'Tight BB (20,1)', description: 'Narrower 1 std dev bands. More sensitive to price movements. Earlier signals but more noise. Best for scalping.', params: { period: 20, std: 1 } },
      { id: 'bb-squeeze', name: 'BB Squeeze', description: 'Detects low volatility periods before breakouts. Trades the expansion after squeeze. High win rate on volatile stocks.', params: { period: 20, std: 2 } },
      { id: 'bb-rsi', name: 'BB + RSI', description: 'Combines volatility bands with momentum. Both must confirm for entry. Excellent for swing trading with lower risk.', params: { period: 20, std: 2, rsi: 14 } }
    ],
    bonusTip: 'Band Width Index - narrower bands indicate breakout is coming soon.'
  },
  {
    id: 'ml-lstm',
    name: 'ML / LSTM Predictions',
    category: 'AI Forecasting',
    icon: '🤖',
    color: 'from-indigo-500 to-purple-500',
    description: 'Machine Learning models for price prediction and pattern recognition',
    idealTimeframes: ['1D / 1W (Swing / Long-term)'],
    subStrategies: [
      { id: 'lstm-regression', name: 'LSTM Price Forecast', description: 'Neural network predicts exact future price. Uses 60-day lookback window. Best for daily/weekly predictions with 70%+ accuracy.', params: { lookback: 60, horizon: 1 } },
      { id: 'lstm-classification', name: 'Signal Classification', description: 'AI categorizes as Buy/Sell/Hold. Simpler than regression. Good for swing trading decisions without exact price targets.', params: { lookback: 60 } },
      { id: 'ensemble', name: 'Ensemble Model', description: 'Combines LSTM + XGBoost for maximum accuracy. Best of both worlds. Slower but most reliable for important trades.', params: { lookback: 60 } },
      { id: 'lstm-multi', name: 'Multi-horizon Forecast', description: 'Predicts 1hr, 1day, and 5day ahead simultaneously. Great for position sizing and planning multiple timeframe exits.', params: { lookback: 60, horizons: [1, 5, 20] } }
    ],
    bonusTip: 'Train on 60-200 candles for better pattern recognition.'
  },
  {
    id: 'supertrend',
    name: 'Supertrend',
    category: 'Trend Continuation',
    icon: '🚀',
    color: 'from-yellow-500 to-orange-500',
    description: 'ATR-based trend following indicator with clear signals',
    idealTimeframes: ['15 min / 30 min (Intraday)', '1D (Swing)'],
    subStrategies: [
      { id: 'st-default', name: 'Default Supertrend (10,3)', description: 'Balanced ATR-based trend following. Clear buy/sell signals. Great for beginners. Works on 15min-1D charts.', params: { period: 10, multiplier: 3 } },
      { id: 'st-aggressive', name: 'Fast Supertrend (7,2)', description: 'Quick trend changes. More signals but higher false positives. Perfect for volatile intraday trading on 5-15min charts.', params: { period: 7, multiplier: 2 } },
      { id: 'st-conservative', name: 'Conservative (14,4)', description: 'Fewer whipsaws with wider bands. Stays in trends longer. Ideal for swing trading and reducing trading costs.', params: { period: 14, multiplier: 4 } },
      { id: 'st-dual', name: 'Dual Supertrend', description: 'Uses 2 Supertrends for confirmation. Trade only when both align. Strongest signals with best risk/reward ratio.', params: { short: [7, 2], long: [14, 3] } }
    ],
    bonusTip: 'Track consecutive same-color candles for trend strength.'
  },
  {
    id: 'ichimoku',
    name: 'Ichimoku Cloud',
    category: 'Multi-signal System',
    icon: '☁️',
    color: 'from-cyan-500 to-blue-500',
    description: 'Comprehensive indicator with support/resistance and momentum signals',
    idealTimeframes: ['1hr / 4hr / 1D (Medium-term)'],
    subStrategies: [
      { id: 'ich-standard', name: 'Standard Ichimoku (9,26,52)', description: 'Traditional Japanese settings. Complete 5-line system. Shows trend, momentum, support/resistance all at once. Best on 1hr+ charts.', params: { tenkan: 9, kijun: 26, senkou: 52 } },
      { id: 'ich-crypto', name: 'Crypto Ichimoku (20,60,120)', description: 'Adjusted for 24/7 crypto markets. Longer periods account for weekend trading. Use for Bitcoin and major altcoins.', params: { tenkan: 20, kijun: 60, senkou: 120 } },
      { id: 'ich-price-cloud', name: 'Price vs Cloud', description: 'Simplified approach. Just watch if price is above (bullish) or below (bearish) cloud. Easy for beginners.', params: { tenkan: 9, kijun: 26, senkou: 52 } },
      { id: 'ich-tk-cross', name: 'TK Cross Strategy', description: 'Focuses on Tenkan-Kijun crossovers. Earlier signals than cloud. Good for active traders who want more entries.', params: { tenkan: 9, kijun: 26, senkou: 52 } }
    ],
    bonusTip: 'Thin cloud = weaker trend, thick cloud = strong resistance/support.'
  },
  {
    id: 'adx-dmi',
    name: 'ADX + DMI',
    category: 'Trend Strength',
    icon: '💪',
    color: 'from-red-500 to-pink-500',
    description: 'Measure trend strength and direction using DMI indicators',
    idealTimeframes: ['15 min / 1hr (Validation)', '1D (Long-term)'],
    subStrategies: [
      { id: 'adx-standard', name: 'Standard ADX (14)', description: 'Classic trend strength gauge. ADX > 25 = strong trend worth trading. Filters out choppy markets. Perfect risk management tool.', params: { period: 14, threshold: 25 } },
      { id: 'adx-aggressive', name: 'Aggressive ADX (14)', description: 'Lower threshold (>20) catches trends earlier. More trades but some weaker trends. Good for experienced traders.', params: { period: 14, threshold: 20 } },
      { id: 'adx-filter', name: 'ADX as Filter', description: 'Use with other strategies. Only trade EMA/RSI signals when ADX confirms strong trend. Dramatically improves win rate.', params: { period: 14, threshold: 25 } },
      { id: 'adx-dmi-cross', name: 'DMI Crossover', description: 'Trades +DI/-DI crossovers. Shows exact trend direction change. Works independently without other indicators.', params: { period: 14 } }
    ],
    bonusTip: 'Use ADX as filter - only trade EMA crossover if ADX > 25.'
  },
  {
    id: 'vwap',
    name: 'VWAP',
    category: 'Institutional Trading',
    icon: '🏦',
    color: 'from-teal-500 to-green-500',
    description: 'Volume Weighted Average Price for intraday institutional levels',
    idealTimeframes: ['1 min / 3 min / 5 min (Scalping)'],
    subStrategies: [
      { id: 'vwap-standard', name: 'Standard VWAP', description: 'Institutional average price line. Price above = bullish, below = bearish. Resets daily. Perfect for day trading.', params: { bands: false } },
      { id: 'vwap-bands', name: 'VWAP Bands', description: 'Adds standard deviation bands around VWAP. Shows overbought/oversold vs institutional levels. Like Bollinger Bands but better.', params: { bands: true, std: 2 } },
      { id: 'vwap-bounce', name: 'VWAP Bounce', description: 'Mean reversion strategy. Buy dips to VWAP, sell rallies away. High win rate in ranging market conditions.', params: { bands: true } },
      { id: 'vwap-breakout', name: 'VWAP Breakout', description: 'Trades strong moves away from VWAP. Confirms institutional momentum. Best for trending stocks with volume.', params: { bands: true, std: 2 } }
    ],
    bonusTip: 'VWAP resets daily - perfect for same-day traders.'
  },
  {
    id: 'breakout',
    name: 'Breakout Strategy',
    category: 'Support/Resistance',
    icon: '💥',
    color: 'from-pink-500 to-rose-500',
    description: 'Trade breakouts from key support and resistance levels',
    idealTimeframes: ['15 min / 1hr (Intraday)', '1D (Swing)'],
    subStrategies: [
      { id: 'break-high-low', name: '20-Bar High/Low', description: 'Simple breakout above recent highs or below lows. No confirmations. Fast entries but some false breaks. Good for liquid stocks.', params: { period: 20, volume_confirm: false } },
      { id: 'break-volume', name: 'Volume Breakout', description: 'Requires 1.5x average volume on breakout. Confirms institutional participation. Much higher success rate than simple breakouts.', params: { period: 20, volume_confirm: true, volume_mult: 1.5 } },
      { id: 'break-retest', name: 'Breakout Retest', description: 'Waits for pullback to breakout level before entry. Lower risk, better entry price. Misses some fast moves but safer.', params: { period: 20, wait_retest: true } },
      { id: 'break-false', name: 'False Breakout Detection', description: 'Fades fake breakouts for reversal trades. Contrarian strategy. Requires experience but very profitable when right.', params: { period: 20, false_break: true } }
    ],
    bonusTip: 'Always confirm breakout with volume > 20-period average.'
  }
]
