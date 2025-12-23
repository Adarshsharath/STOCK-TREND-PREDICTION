import React from 'react'
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

const SignalDetailsModal = ({ signal, onClose }) => {
  if (!signal) return null

  const isBuy = signal.type === 'BUY'

  // Beginner-friendly explanations for each strategy
  const strategyExplanations = {
    'EMA Crossover': {
      buy: {
        title: '✅ Consider Buying',
        explanation: 'The short-term moving average has crossed above the long-term average, indicating an upward trend is starting.',
        action: 'This is generally a good time to BUY as the price momentum is shifting upward.',
        risk: 'Low Risk - Wait for confirmation with volume increase',
        beginner: 'Think of this like a car accelerating - the price is gaining upward momentum!'
      },
      sell: {
        title: '⚠️ Consider Selling',
        explanation: 'The short-term moving average has crossed below the long-term average, signaling a potential downward trend.',
        action: 'Consider SELLING or taking profits as the upward momentum is weakening.',
        risk: 'Medium Risk - Watch for false signals in choppy markets',
        beginner: 'Like a car slowing down - the upward momentum is fading, time to be cautious.'
      }
    },
    'RSI': {
      buy: {
        title: '✅ Oversold - Good Entry',
        explanation: 'The RSI indicator shows the stock is oversold (below 30), meaning it may have been sold too much and is due for a bounce.',
        action: 'This is a potential BUY opportunity as the stock may rebound from oversold conditions.',
        risk: 'Low-Medium Risk - Best in ranging markets',
        beginner: 'Like finding a sale at your favorite store - the price dropped too much and might bounce back!'
      },
      sell: {
        title: '⚠️ Overbought - Take Profits',
        explanation: 'The RSI shows the stock is overbought (above 70), indicating it may have risen too quickly and could correct.',
        action: 'Consider SELLING or taking profits as the stock might pull back from overbought levels.',
        risk: 'Low Risk - Protect your gains',
        beginner: 'Like a balloon that\'s been inflated too much - it needs to release some air (price correction).'
      }
    },
    'MACD': {
      buy: {
        title: '✅ Bullish Momentum',
        explanation: 'The MACD line crossed above the signal line, showing increasing bullish momentum.',
        action: 'Strong BUY signal - momentum is building in the upward direction.',
        risk: 'Medium Risk - Confirm with price action',
        beginner: 'Like a rocket getting ready to launch - the momentum is building upward!'
      },
      sell: {
        title: '⚠️ Bearish Momentum',
        explanation: 'The MACD line crossed below the signal line, indicating weakening bullish momentum or increasing bearish pressure.',
        action: 'SELL signal - momentum is shifting downward, consider exiting positions.',
        risk: 'Medium Risk - Monitor closely',
        beginner: 'The momentum train is changing direction - time to consider getting off!'
      }
    },
    'Bollinger Bands': {
      buy: {
        title: '✅ Bounce From Lower Band',
        explanation: 'Price touched the lower Bollinger Band, suggesting it\'s at a support level and may bounce back up.',
        action: 'BUY opportunity - stock is at the lower range and historically bounces from here.',
        risk: 'Low-Medium Risk - Better in ranging markets',
        beginner: 'Like a basketball hitting the ground - it tends to bounce back up!'
      },
      sell: {
        title: '⚠️ Near Upper Band',
        explanation: 'Price is near or touching the upper Bollinger Band, indicating it might be overextended.',
        action: 'Consider SELLING - price is at the upper range and might pull back.',
        risk: 'Medium Risk - Could continue in strong trends',
        beginner: 'Like stretching a rubber band - it can\'t go much further without snapping back!'
      }
    },
    'SuperTrend': {
      buy: {
        title: '✅ Trend Turned Bullish',
        explanation: 'SuperTrend indicator flipped to green, confirming a bullish trend has started.',
        action: 'Strong BUY - ride the uptrend with a clear stop loss at the SuperTrend line.',
        risk: 'Low Risk - Clear exit point',
        beginner: 'The traffic light turned GREEN - clear road ahead for price to go up!'
      },
      sell: {
        title: '⚠️ Trend Turned Bearish',
        explanation: 'SuperTrend flipped to red, indicating the uptrend is over and a downtrend may have begun.',
        action: 'SELL immediately - exit position to protect capital.',
        risk: 'Low Risk - Clear signal',
        beginner: 'The traffic light turned RED - stop and get out to avoid losses!'
      }
    },
    'Ichimoku Cloud': {
      buy: {
        title: '✅ Above The Cloud',
        explanation: 'Price broke above the Ichimoku Cloud, a strong bullish signal showing multiple confirmations.',
        action: 'BUY with confidence - all systems are showing upward momentum.',
        risk: 'Low Risk - Multiple confirmations',
        beginner: 'Like an airplane flying above the clouds - smooth sailing ahead with clear skies!'
      },
      sell: {
        title: '⚠️ Below The Cloud',
        explanation: 'Price dropped below the cloud, indicating bearish conditions with resistance above.',
        action: 'SELL or avoid buying - bearish trend with strong resistance overhead.',
        risk: 'Medium Risk',
        beginner: 'Like being underwater - hard to swim back up with all that pressure above!'
      }
    },
    'ADX + DMI': {
      buy: {
        title: '✅ Strong Uptrend',
        explanation: 'ADX shows trend strength is high and +DI is above -DI, confirming a strong uptrend.',
        action: 'BUY - strong trending conditions favor upward movement.',
        risk: 'Low Risk - High conviction trade',
        beginner: 'Like running downhill with the wind at your back - everything is helping you go up!'
      },
      sell: {
        title: '⚠️ Strong Downtrend',
        explanation: 'ADX shows strong trend but -DI is dominating, indicating powerful bearish momentum.',
        action: 'SELL or stay out - strong downward pressure.',
        risk: 'Low Risk for sellers',
        beginner: 'Like trying to swim against a strong current - better to go with the flow (down)!'
      }
    },
    'VWAP': {
      buy: {
        title: '✅ Price Above VWAP',
        explanation: 'Price moved above the Volume Weighted Average Price, showing institutional buying interest.',
        action: 'BUY - institutions are accumulating, follow the smart money.',
        risk: 'Low-Medium Risk',
        beginner: 'The big players (institutions) are buying - follow the pros!'
      },
      sell: {
        title: '⚠️ Price Below VWAP',
        explanation: 'Price fell below VWAP, suggesting institutional selling or lack of support.',
        action: 'SELL or wait - institutions aren\'t supporting higher prices.',
        risk: 'Medium Risk',
        beginner: 'The big players are stepping back - not a good time to buy.'
      }
    },
    'Breakout': {
      buy: {
        title: '✅ Breakout Above Resistance',
        explanation: 'Price broke above a key resistance level with volume, indicating potential for continued upward movement.',
        action: 'BUY - momentum is strong, price is breaking free from consolidation.',
        risk: 'Medium Risk - Watch for false breakouts',
        beginner: 'Like breaking through a ceiling - once you\'re through, there\'s room to fly higher!'
      },
      sell: {
        title: '⚠️ Breakdown Below Support',
        explanation: 'Price broke below support level, suggesting weakness and potential for further decline.',
        action: 'SELL - support is broken, more downside likely.',
        risk: 'Medium Risk',
        beginner: 'Like falling through a floor - once it breaks, you keep falling until you hit the next floor!'
      }
    },
    'ML / LSTM': {
      buy: {
        title: '✅ AI Predicts Upward Move',
        explanation: 'Machine learning model analyzed historical patterns and predicts upward price movement.',
        action: 'BUY - AI has identified bullish patterns similar to past successful trades.',
        risk: 'Medium Risk - AI is probabilistic',
        beginner: 'The computer brain studied thousands of patterns and thinks the price will go up!'
      },
      sell: {
        title: '⚠️ AI Predicts Downward Move',
        explanation: 'The ML model detected patterns that historically led to price declines.',
        action: 'SELL or avoid - AI sees warning signs based on historical data.',
        risk: 'Medium Risk',
        beginner: 'The computer brain recognized danger patterns and suggests getting out!'
      }
    }
  }

  const details = strategyExplanations[signal.strategyName]?.[isBuy ? 'buy' : 'sell'] || {
    title: isBuy ? '✅ Buy Signal' : '⚠️ Sell Signal',
    explanation: 'Signal detected by the trading strategy.',
    action: isBuy ? 'Consider buying this stock.' : 'Consider selling this stock.',
    risk: 'Standard Risk',
    beginner: 'The strategy detected a trading opportunity.'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${isBuy ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} text-white p-6 rounded-t-2xl`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {isBuy ? (
                <TrendingUp className="w-8 h-8" />
              ) : (
                <TrendingDown className="w-8 h-8" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{details.title}</h2>
                <p className="text-white text-opacity-90">{signal.strategyName} Strategy</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Signal Info */}
          <div className="bg-gray-50 dark:bg-dark-bg-elevated rounded-xl p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-muted mb-1">Stock Symbol</p>
              <p className="text-xl font-bold text-gray-900 dark:text-dark-text">{signal.symbol}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-dark-text-muted mb-1">Price</p>
              <p className="text-xl font-bold text-gray-900 dark:text-dark-text">₹{signal.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Beginner Explanation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-neon-blue rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-neon-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">For Beginners:</p>
                <p className="text-blue-800 dark:text-blue-200">{details.beginner}</p>
              </div>
            </div>
          </div>

          {/* Technical Explanation */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-2 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-gray-700 dark:text-neon-green" />
              <span>What's Happening?</span>
            </h3>
            <p className="text-gray-700 dark:text-dark-text-secondary leading-relaxed">{details.explanation}</p>
          </div>

          {/* Recommended Action */}
          <div className={`${isBuy ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-neon-green' : 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-neon-pink'} border-l-4 rounded-lg p-4`}>
            <h3 className={`font-semibold mb-2 ${isBuy ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}`}>
              Recommended Action:
            </h3>
            <p className={`${isBuy ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>{details.action}</p>
          </div>

          {/* Risk Level */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-neon-orange rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-neon-orange mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">Risk Level:</p>
                <p className="text-yellow-800 dark:text-yellow-200">{details.risk}</p>
              </div>
            </div>
          </div>

          {/* Important Disclaimer */}
          <div className="bg-gray-100 dark:bg-dark-bg-elevated rounded-lg p-4 border border-gray-300 dark:border-dark-border">
            <p className="text-xs text-gray-600 dark:text-dark-text-muted text-center">
              <strong className="text-gray-900 dark:text-dark-text">Disclaimer:</strong> This is educational information only and not financial advice. 
              Always do your own research and consult with a financial advisor before making trading decisions.
              Past performance does not guarantee future results.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-900 dark:bg-neon-purple hover:bg-gray-800 dark:hover:bg-neon-purple/80 text-white font-semibold py-3 px-6 rounded-lg transition dark:shadow-neon"
          >
            Got It!
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SignalDetailsModal
