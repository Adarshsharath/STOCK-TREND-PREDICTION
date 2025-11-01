import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Lightbulb, Target, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'

const STRATEGY_EXPLANATIONS = {
  'ema-crossover': {
    name: 'EMA Crossover Strategy',
    icon: '📈',
    tagline: 'Follow the trend with moving averages',
    whatIs: 'EMA (Exponential Moving Average) Crossover is like watching two lines on a chart. When the fast line crosses above the slow line, it suggests prices are going up - time to buy! When it crosses below, prices might go down - time to sell.',
    howItWorks: [
      'We use two EMAs: a fast one (reacts quickly to price changes) and a slow one (more stable)',
      'When the fast EMA crosses ABOVE the slow EMA = BUY signal (uptrend starting)',
      'When the fast EMA crosses BELOW the slow EMA = SELL signal (downtrend starting)',
      'The bigger the gap between the two EMAs, the stronger the trend'
    ],
    whenToUse: [
      '✅ Trending markets (clear up or down movements)',
      '✅ When you want simple, easy-to-spot signals',
      '✅ For swing trading (holding for days to weeks)',
      '❌ Avoid in choppy/sideways markets (too many false signals)'
    ],
    realExample: 'Imagine stock price is ₹100. The 9-day EMA is ₹98 and 21-day EMA is ₹96. The fast EMA (98) is above the slow EMA (96), indicating an uptrend. When this crossover happens, you get a BUY signal. Later, if the 9-day EMA falls to ₹94 and crosses below the 21-day EMA (still at ₹96), you get a SELL signal.',
    tips: [
      'Use 9 and 21 periods for day trading',
      'Use 50 and 200 periods for long-term investing',
      'Add volume confirmation - signals are stronger when volume is high',
      'Always wait for the crossover to complete before entering'
    ],
    riskLevel: 'Medium',
    bestFor: 'Beginners to intermediate traders'
  },
  'rsi': {
    name: 'RSI Strategy',
    icon: '⚡',
    tagline: 'Buy low, sell high with momentum',
    whatIs: 'RSI (Relative Strength Index) is like a speedometer for stock prices. It tells you if a stock is overbought (too expensive, likely to fall) or oversold (too cheap, likely to rise). It uses a scale from 0-100.',
    howItWorks: [
      'RSI measures how fast and how much prices are changing',
      'RSI below 30 = Oversold (stock might be too cheap - BUY opportunity)',
      'RSI above 70 = Overbought (stock might be too expensive - SELL opportunity)',
      'The closer to 0, the more oversold. The closer to 100, the more overbought'
    ],
    whenToUse: [
      '✅ Range-bound markets (prices moving sideways)',
      '✅ To find reversal points (when trends change direction)',
      '✅ For quick trades (scalping and day trading)',
      '❌ Avoid in strong trending markets (RSI can stay extreme for long)'
    ],
    realExample: 'Stock is at ₹200 and RSI hits 25 (very oversold). This means selling pressure is exhausted. When RSI crosses back above 30, you get a BUY signal. The stock rises to ₹230 and RSI reaches 78 (overbought). When it drops below 70, you get a SELL signal.',
    tips: [
      'Wait for RSI to cross back from extreme zones before entering',
      'Use 14-period RSI for standard analysis',
      'In strong uptrends, use 40 as oversold instead of 30',
      'Combine with trend indicators for better accuracy'
    ],
    riskLevel: 'Medium',
    bestFor: 'Traders who like to catch reversals'
  },
  'macd': {
    name: 'MACD Strategy',
    icon: '📊',
    tagline: 'Catch trends early with momentum',
    whatIs: 'MACD (Moving Average Convergence Divergence) shows you when momentum is building in a stock. Think of it as watching two cars racing - when the faster car (MACD line) overtakes the slower car (Signal line), the race is heating up!',
    howItWorks: [
      'MACD has two main lines: MACD line (fast) and Signal line (slow)',
      'When MACD line crosses ABOVE Signal line = BUY (momentum is bullish)',
      'When MACD line crosses BELOW Signal line = SELL (momentum is bearish)',
      'The histogram shows the distance between the two lines (strength of momentum)'
    ],
    whenToUse: [
      '✅ Trending markets with clear direction',
      '✅ For medium-term trades (swing trading)',
      '✅ To confirm breakouts and trend strength',
      '❌ Avoid in flat, sideways markets'
    ],
    realExample: 'Stock at ₹150. MACD line is at -2 and Signal line at -1. Both are negative (downtrend). Suddenly, MACD crosses above Signal line - BUY signal! Stock rises to ₹165. MACD line now at +3, Signal at +2. When MACD falls and crosses below Signal - SELL signal!',
    tips: [
      'Use standard settings: 12, 26, 9 for most stocks',
      'Watch the histogram - getting taller means momentum is accelerating',
      'Zero line crossover is also important (bullish above, bearish below)',
      'Best combined with trend confirmation from EMAs'
    ],
    riskLevel: 'Medium',
    bestFor: 'Trend followers and swing traders'
  },
  'bollinger': {
    name: 'Bollinger Bands Strategy',
    icon: '🎯',
    tagline: 'Trade the squeeze and expansion',
    whatIs: 'Bollinger Bands are like elastic bands around the price. When the bands are tight, prices are calm - but a big move is coming! When bands are wide, prices are wild. Buy when price touches the bottom band, sell when it touches the top.',
    howItWorks: [
      'Three lines: Middle line (average), Upper band (expensive zone), Lower band (cheap zone)',
      'Bands squeeze tight when volatility is low = Big move coming soon!',
      'Bands widen when volatility is high = Prices moving a lot',
      'Price touching lower band = Oversold, time to BUY',
      'Price touching upper band = Overbought, time to SELL'
    ],
    whenToUse: [
      '✅ Range-bound markets (prices bouncing between levels)',
      '✅ For scalping and quick trades',
      '✅ Before major news events (watch for squeeze)',
      '❌ Avoid during strong trends (price can "ride" the bands)'
    ],
    realExample: 'Stock bouncing between ₹95-₹105. Bollinger Bands show: Lower band at ₹95, Middle at ₹100, Upper at ₹105. Price drops to ₹95 (touches lower band) - BUY signal. Price rises to ₹105 (touches upper band) - SELL signal. Made ₹10 profit!',
    tips: [
      'Use 20-period with 2 standard deviations for standard setup',
      'When bands squeeze very tight, prepare for breakout (big move coming)',
      'Price often returns to middle band - good for take-profit',
      'Combine with RSI to avoid false signals'
    ],
    riskLevel: 'Low-Medium',
    bestFor: 'Scalpers and range traders'
  },
  'supertrend': {
    name: 'SuperTrend Strategy',
    icon: '🚀',
    tagline: 'Ride the trend with clear signals',
    whatIs: 'SuperTrend is like a traffic light for trading. When it turns green, prices are going up - stay in! When it turns red, prices are going down - stay out! It uses volatility to give you very clear, easy-to-follow signals.',
    howItWorks: [
      'SuperTrend line appears on the chart - either green (buy) or red (sell)',
      'When line turns GREEN and moves below price = BUY signal (uptrend)',
      'When line turns RED and moves above price = SELL signal (downtrend)',
      'The line acts as a trailing stop-loss - protecting your profits'
    ],
    whenToUse: [
      '✅ Strong trending markets (clear up or down)',
      '✅ For intraday and swing trading',
      '✅ When you want simple, visual signals',
      '❌ Avoid in choppy markets (too many flips)'
    ],
    realExample: 'Stock at ₹120. SuperTrend shows green line at ₹115 (support). Price rises to ₹130, ₹140, ₹150 - green line keeps following below. At ₹150, line flips to red at ₹155 - SELL signal! You rode the whole trend from ₹120 to ₹150, making ₹30 profit.',
    tips: [
      'Use 10-period ATR with multiplier of 3 for standard trading',
      "Let profits run - stay in as long as color doesn't change",
      'Use the line itself as your stop-loss level',
      'In very volatile stocks, increase multiplier to 4 for fewer signals'
    ],
    riskLevel: 'Medium',
    bestFor: 'Trend followers who want simplicity'
  },
  'ichimoku': {
    name: 'Ichimoku Cloud Strategy',
    icon: '☁️',
    tagline: 'All-in-one trend system',
    whatIs: 'Ichimoku Cloud is like looking at the weather forecast for stocks. The "cloud" shows you support and resistance levels. Price above the cloud = sunny (bullish), below the cloud = stormy (bearish). It gives you everything in one view!',
    howItWorks: [
      'The Cloud: Price above cloud = BUY zone, below cloud = SELL zone',
      'Cloud color: Green cloud = strong support, Red cloud = strong resistance',
      'Tenkan/Kijun cross: When Tenkan crosses above Kijun = BUY signal',
      'Thick cloud = strong trend, Thin cloud = weak trend'
    ],
    whenToUse: [
      '✅ Medium to long-term trading',
      '✅ When you want complete picture (trend, momentum, support/resistance)',
      '✅ For confident trend following',
      '❌ Too complex for beginners or scalping'
    ],
    realExample: 'Stock at ₹180 below a red cloud (₹185-₹195). Price breaks above cloud - BUY signal! Cloud turns green, providing support. Price rises to ₹220. Later, price falls back into cloud - Warning! Falls below cloud - SELL signal at ₹210. Still made ₹30 profit.',
    tips: [
      'Focus on price vs cloud relationship first (simplest)',
      'Only trade in direction of cloud (above cloud = only buy)',
      'Wait for price to break through cloud before entering',
      'Use on daily or 4-hour charts for best results'
    ],
    riskLevel: 'Medium',
    bestFor: 'Serious traders wanting comprehensive analysis'
  },
  'adx-dmi': {
    name: 'ADX + DMI Strategy',
    icon: '💪',
    tagline: 'Measure trend strength before trading',
    whatIs: "ADX (Average Directional Index) is like a strength meter for trends. It doesn't tell you if price is going up or down - it tells you HOW STRONG the trend is. Only trade when ADX says the trend is strong enough!",
    howItWorks: [
      'ADX line shows trend strength: Below 20 = Weak, 20-40 = Strong, Above 40 = Very Strong',
      '+DI (green) and -DI (red) show direction',
      'When +DI crosses above -DI AND ADX > 25 = Strong BUY',
      'When -DI crosses above +DI AND ADX > 25 = Strong SELL',
      'If ADX < 20, don\'t trade - trend too weak!'
    ],
    whenToUse: [
      '✅ As a filter for other strategies (only trade if ADX confirms strength)',
      '✅ To avoid false signals in ranging markets',
      '✅ For swing and position trading',
      '❌ Not for standalone signals (use with other indicators)'
    ],
    realExample: 'EMA gives BUY signal at ₹100, but ADX is only 15 (weak trend) - SKIP IT! Later, another EMA BUY signal at ₹110 with ADX at 30 (strong trend) - TAKE IT! Price rises to ₹125 because the trend was genuinely strong.',
    tips: [
      'Use ADX as a "green light" for other strategies',
      'ADX above 25 = Safe to trade trends',
      'Rising ADX = Trend getting stronger (stay in trade)',
      'Falling ADX = Trend weakening (prepare to exit)'
    ],
    riskLevel: 'Low (when used as filter)',
    bestFor: 'Risk-conscious traders who want confirmation'
  },
  'vwap': {
    name: 'VWAP Strategy',
    icon: '🏦',
    tagline: 'Trade like institutions',
    whatIs: 'VWAP (Volume Weighted Average Price) is the average price big players (institutions, banks) are buying at. When price is above VWAP, it\'s expensive. Below VWAP, it\'s cheap. Trade around this "fair value" line!',
    howItWorks: [
      'VWAP is a line showing the volume-weighted average price for the day',
      'Price above VWAP = Bullish (institutions are buying) = Stay long',
      'Price below VWAP = Bearish (institutions are selling) = Stay out or short',
      'Price bouncing off VWAP = Great entry point'
    ],
    whenToUse: [
      '✅ Intraday trading (VWAP resets daily)',
      '✅ Scalping (quick in and out trades)',
      '✅ To find fair value entry points',
      '❌ Not for multi-day positions (VWAP resets)'
    ],
    realExample: 'Morning: VWAP at ₹200, price dips to ₹198 and bounces back up - BUY at ₹199. Price rises above VWAP to ₹205. Stays above VWAP all day, reaches ₹210 - SELL before close. Made ₹11 profit following institutional flow!',
    tips: [
      'VWAP only works for intraday - it resets every morning',
      'Price above VWAP = Go long, Below VWAP = Avoid or short',
      'Best on high-volume liquid stocks',
      'Add standard deviation bands around VWAP for better entries'
    ],
    riskLevel: 'Low-Medium',
    bestFor: 'Intraday traders and scalpers'
  },
  'breakout': {
    name: 'Breakout Strategy',
    icon: '💥',
    tagline: 'Catch explosive moves',
    whatIs: 'Breakout trading is like waiting for a rocket to launch. Price gets stuck in a range, building up pressure. When it finally breaks out above resistance or below support, it explodes! Jump on board and ride the momentum.',
    howItWorks: [
      'Identify range: Price stuck between support (bottom) and resistance (top)',
      'Wait for breakout: Price breaks above resistance with high volume = BUY',
      'Or breakdown: Price breaks below support with high volume = SELL',
      'Volume is key - without it, breakout might be fake!'
    ],
    whenToUse: [
      '✅ When stock consolidating (moving sideways)',
      '✅ Before earnings or major news',
      '✅ For capturing big, fast moves',
      '❌ Avoid if volume is low (fake breakouts common)'
    ],
    realExample: 'Stock stuck between ₹145-₹155 for 2 weeks. Volume increases, price breaks to ₹157 - BUY signal! Price shoots up to ₹170 within days. Made ₹15 profit catching the breakout momentum!',
    tips: [
      'Always wait for volume confirmation (1.5x average volume minimum)',
      'Set stop-loss just below breakout point',
      'First hour of trading has most reliable breakouts',
      'Beware of "false breakouts" - price breaks then immediately falls back'
    ],
    riskLevel: 'Medium-High',
    bestFor: 'Aggressive traders hunting big moves'
  },
  'ml-lstm': {
    name: 'ML LSTM Strategy',
    icon: '🤖',
    tagline: 'AI predicts the future',
    whatIs: 'LSTM (Long Short-Term Memory) is a type of AI that learns from past price patterns to predict future movements. It\'s like having a robot that studied thousands of stocks and can spot patterns humans can\'t see!',
    howItWorks: [
      'AI analyzes 60 days of historical data',
      'Learns patterns in price movements, volume, and indicators',
      'Predicts if price will go UP or DOWN',
      'Gives confidence score (how sure the AI is)'
    ],
    whenToUse: [
      '✅ For daily or weekly predictions',
      '✅ When you want data-driven decisions',
      '✅ To confirm signals from other strategies',
      '❌ Not reliable during major news events (AI can\'t predict news)'
    ],
    realExample: 'LSTM analyzes TCS for 60 days, sees uptrend pattern. Predicts UP with 75% confidence. You BUY at ₹3,500. Over next week, price rises to ₹3,650 - AI was right! Made ₹150 profit following the AI.',
    tips: [
      'Use daily timeframe for best accuracy',
      'Look for 70%+ confidence scores',
      'Combine with technical indicators for confirmation',
      'Retrain model monthly for updated patterns'
    ],
    riskLevel: 'Medium',
    bestFor: 'Tech-savvy traders who trust AI'
  }
}

const StrategyLearn = () => {
  const { strategyId } = useParams()
  const navigate = useNavigate()
  
  const strategy = STRATEGY_EXPLANATIONS[strategyId]

  if (!strategy) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Strategy information not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-primary hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8">
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-6xl">{strategy.icon}</span>
          <div>
            <h1 className="text-4xl font-bold mb-2">{strategy.name}</h1>
            <p className="text-xl text-white text-opacity-90">{strategy.tagline}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-6">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            strategy.riskLevel === 'Low' || strategy.riskLevel.includes('Low') ? 'bg-green-500' :
            strategy.riskLevel === 'Medium' || strategy.riskLevel.includes('Medium') ? 'bg-yellow-500' :
            'bg-red-500'
          }`}>
            {strategy.riskLevel} Risk
          </span>
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-white bg-opacity-20">
            {strategy.bestFor}
          </span>
        </div>
      </div>

      {/* What Is It? */}
      <div className="bg-white rounded-xl p-8 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-text">What Is It?</h2>
        </div>
        <p className="text-lg text-text-light leading-relaxed">
          {strategy.whatIs}
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-8 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-text">How It Works (Step by Step)</h2>
        </div>
        <div className="space-y-3">
          {strategy.howItWorks.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {idx + 1}
              </div>
              <p className="text-text-light leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* When To Use */}
      <div className="bg-white rounded-xl p-8 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-text">When To Use This Strategy</h2>
        </div>
        <div className="space-y-2">
          {strategy.whenToUse.map((condition, idx) => (
            <div key={idx} className={`flex items-start space-x-3 p-3 rounded-lg ${
              condition.startsWith('✅') ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className={`text-sm leading-relaxed ${
                condition.startsWith('✅') ? 'text-green-800' : 'text-red-800'
              }`}>
                {condition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Real Example */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-purple-900">Real-Life Example</h2>
        </div>
        <p className="text-purple-800 leading-relaxed text-lg">
          {strategy.realExample}
        </p>
      </div>

      {/* Pro Tips */}
      <div className="bg-white rounded-xl p-8 shadow-card">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-text">Pro Tips</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategy.tips.map((tip, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Try It Now Button */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold mb-3">Ready to Try {strategy.name}?</h3>
        <p className="text-white text-opacity-90 mb-6">
          Test this strategy on real stocks and see how it performs!
        </p>
        <button
          onClick={() => navigate(`/strategies/${strategyId}`)}
          className="bg-white text-primary px-8 py-3 rounded-lg font-bold text-lg hover:bg-opacity-90 transition"
        >
          Analyze With This Strategy →
        </button>
      </div>
    </div>
  )
}

export default StrategyLearn
