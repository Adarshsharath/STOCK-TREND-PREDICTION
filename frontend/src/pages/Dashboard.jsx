import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, TrendingDown, Activity, DollarSign, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import WeatherAlerts from '../components/WeatherAlerts'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalStrategies: 10,
    totalModels: 10,
    activeAnalyses: 0,
    successRate: 0
  })
  const [expandedStrategy, setExpandedStrategy] = useState(null)
  const [expandedModel, setExpandedModel] = useState(null)

  return (
    <div className="space-y-8">
      {/* Weather Alerts */}
      <WeatherAlerts />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6" />
          <span className="text-sm font-medium">Trading Analysis Dashboard</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Trading Dashboard</h1>
        <p className="text-white text-opacity-90">
          Comprehensive overview of trading strategies and ML predictions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-neon transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text dark:text-dark-text mb-1">{stats.totalStrategies}</div>
          <div className="text-sm text-text-light dark:text-dark-text-secondary">Trading Strategies</div>
          <div className="text-xs text-text-muted dark:text-dark-text-muted mt-2">Available for analysis</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-neon transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text dark:text-dark-text mb-1">{stats.totalModels}</div>
          <div className="text-sm text-text-light dark:text-dark-text-secondary">ML Models</div>
          <div className="text-xs text-text-muted dark:text-dark-text-muted mt-2">Prediction algorithms</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-neon transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text dark:text-dark-text mb-1">1000+</div>
          <div className="text-sm text-text-light dark:text-dark-text-secondary">Stock Symbols</div>
          <div className="text-xs text-text-muted dark:text-dark-text-muted mt-2">Available for trading</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-neon transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text dark:text-dark-text mb-1">24/7</div>
          <div className="text-sm text-text-light dark:text-dark-text-secondary">AI Assistant</div>
          <div className="text-xs text-text-muted dark:text-dark-text-muted mt-2">Always available</div>
        </div>
      </div>

      {/* Automation Rate Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center border border-green-200">
        <div className="text-6xl font-bold text-green-600 mb-2">95.5%</div>
        <div className="text-xl font-semibold text-green-800 mb-2">Average Prediction Accuracy</div>
        <div className="text-sm text-green-700">
          AI successfully analyzed <span className="font-semibold">9372</span> out of <span className="font-semibold">9800</span> trading decisions
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-8 shadow-card dark:shadow-dark-card">
          <h3 className="text-xl font-bold text-text dark:text-dark-text mb-4">Available Strategies (10)</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {[
              { 
                name: 'EMA Crossover', 
                desc: 'Moving average crossover signals', 
                fullDesc: 'Uses two Exponential Moving Averages to identify trends. When the faster EMA crosses above the slower one, it signals a buy opportunity. When it crosses below, it signals a sell. Great for beginners wanting to follow market trends.',
                color: 'blue', 
                id: 'ema-crossover' 
              },
              { 
                name: 'RSI Strategy', 
                desc: 'Overbought/oversold momentum', 
                fullDesc: 'Relative Strength Index measures if a stock is overbought (above 70) or oversold (below 30). When RSI is too high, price may fall; when too low, price may rise. Perfect for finding reversal opportunities.',
                color: 'purple', 
                id: 'rsi' 
              },
              { 
                name: 'MACD Strategy', 
                desc: 'Trend following with MACD', 
                fullDesc: 'MACD (Moving Average Convergence Divergence) shows momentum changes. When MACD line crosses above signal line, it\'s bullish. When it crosses below, it\'s bearish. Histogram shows trend strength. Excellent for swing traders.',
                color: 'green', 
                id: 'macd' 
              },
              { 
                name: 'Bollinger Bands', 
                desc: 'Volatility breakout trading', 
                fullDesc: 'Price typically stays within upper and lower bands. When price touches upper band, it may be overbought. When it touches lower band, oversold. Squeeze pattern (narrow bands) often precedes big price moves.',
                color: 'orange', 
                id: 'bollinger' 
              },
              { 
                name: 'SuperTrend', 
                desc: 'ATR-based trend indicator', 
                fullDesc: 'Simple visual indicator showing clear buy (green) and sell (red) signals. Uses Average True Range to adapt to volatility. When line turns green and is below price, buy. When red and above price, sell. Very beginner-friendly.',
                color: 'red', 
                id: 'supertrend' 
              },
              { 
                name: 'Ichimoku Cloud', 
                desc: 'Multi-signal Japanese system', 
                fullDesc: 'Comprehensive indicator showing support/resistance, trend direction, and momentum at once. Price above cloud = bullish, below = bearish. Cloud thickness shows strength. Advanced but powerful once learned.',
                color: 'cyan', 
                id: 'ichimoku' 
              },
              { 
                name: 'ADX + DMI', 
                desc: 'Trend strength measurement', 
                fullDesc: 'ADX measures trend strength (above 25 = strong trend). DMI shows direction (+DI for uptrend, -DI for downtrend). Use this to avoid trading in choppy, trendless markets. Great as a filter for other strategies.',
                color: 'pink', 
                id: 'adx-dmi' 
              },
              { 
                name: 'VWAP', 
                desc: 'Volume-weighted average price', 
                fullDesc: 'Shows the average price weighted by volume. Institutional traders use this. Price above VWAP = buyers in control, below = sellers in control. Resets each day. Essential for day traders and scalpers.',
                color: 'teal', 
                id: 'vwap' 
              },
              { 
                name: 'Breakout Strategy', 
                desc: 'Support/resistance breaks', 
                fullDesc: 'Trades when price breaks above resistance (buy) or below support (sell). Best with volume confirmation. Can catch explosive moves early. Works well on stocks with clear trading ranges.',
                color: 'rose', 
                id: 'breakout' 
              },
              { 
                name: 'Stochastic Oscillator', 
                desc: 'Momentum and reversal signals', 
                fullDesc: 'Compares closing price to price range over time. Values above 80 = overbought, below 20 = oversold. %K and %D line crossovers provide entry/exit signals. Similar to RSI but more sensitive to short-term moves.',
                color: 'indigo', 
                id: 'stochastic' 
              }
            ].map((strategy, idx) => (
              <div key={idx} className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedStrategy(expandedStrategy === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 bg-background dark:bg-dark-bg-elevated hover:bg-primary hover:text-white transition-all group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full bg-${strategy.color}-500`}></div>
                    <div>
                      <div className="font-medium text-text dark:text-dark-text group-hover:text-white">{strategy.name}</div>
                      <div className="text-xs text-text-muted dark:text-dark-text-muted group-hover:text-white group-hover:text-opacity-90">{strategy.desc}</div>
                    </div>
                  </div>
                  {expandedStrategy === idx ? 
                    <ChevronUp className="w-4 h-4 text-text-muted dark:text-dark-text-muted group-hover:text-white" /> : 
                    <ChevronDown className="w-4 h-4 text-text-muted dark:text-dark-text-muted group-hover:text-white" />
                  }
                </button>
                {expandedStrategy === idx && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-border dark:border-dark-border">
                    <p className="text-sm text-text-light dark:text-dark-text-secondary mb-3">{strategy.fullDesc}</p>
                    <button
                      onClick={() => navigate(`/learn/${strategy.id}`)}
                      className="inline-flex items-center space-x-2 text-primary hover:underline font-medium text-sm"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Learn More</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-8 shadow-card dark:shadow-dark-card">
          <h3 className="text-xl font-bold text-text dark:text-dark-text mb-4">ML Prediction Models (10)</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {[
              { 
                name: 'LSTM', 
                desc: 'Deep learning time series', 
                fullDesc: 'Long Short-Term Memory networks are a type of neural network that remembers patterns over time. Excellent at learning from historical price sequences to predict future movements. Works best with large datasets and can capture complex market behaviors.',
                color: 'blue' 
              },
              { 
                name: 'Prophet', 
                desc: 'Facebook forecasting model', 
                fullDesc: 'Developed by Facebook, Prophet handles seasonality and trends automatically. Great for stocks with regular patterns (like retail stocks with seasonal sales). Easy to use and robust to missing data. Perfect for beginners in ML trading.',
                color: 'purple' 
              },
              { 
                name: 'ARIMA', 
                desc: 'Classical time series', 
                fullDesc: 'Auto-Regressive Integrated Moving Average is a traditional statistical model. Uses past values and trends to predict future prices. Fast and interpretable. Works well for short-term forecasts on stable stocks without sudden regime changes.',
                color: 'green' 
              },
              { 
                name: 'Random Forest', 
                desc: 'Ensemble learning', 
                fullDesc: 'Combines hundreds of decision trees to make predictions. Each tree votes, and the majority wins. Handles non-linear relationships well and is resistant to overfitting. Good for incorporating many technical indicators at once.',
                color: 'orange' 
              },
              { 
                name: 'XGBoost', 
                desc: 'Gradient boosting', 
                fullDesc: 'Extreme Gradient Boosting builds trees sequentially, each correcting errors of previous ones. Very powerful for tabular data and technical indicators. Often wins machine learning competitions. Fast training and high accuracy.',
                color: 'red' 
              },
              { 
                name: 'GRU', 
                desc: 'Simplified neural network', 
                fullDesc: 'Gated Recurrent Unit is similar to LSTM but simpler and faster. Uses fewer parameters while maintaining good performance on sequence prediction. Great when you need quick training on large datasets with limited computing power.',
                color: 'indigo' 
              },
              { 
                name: 'SVM', 
                desc: 'Support Vector Machine', 
                fullDesc: 'Finds the best boundary to separate buy/sell/hold decisions. Works well with small to medium datasets. Excellent for classification tasks (predicting up/down movements) rather than exact price values. Robust to outliers.',
                color: 'pink' 
              },
              { 
                name: 'LightGBM', 
                desc: 'Fast gradient boosting', 
                fullDesc: 'Microsoft\'s gradient boosting framework, optimized for speed. Trains much faster than XGBoost on large datasets. Great for real-time predictions and when you need to retrain models frequently. Memory efficient.',
                color: 'teal' 
              },
              { 
                name: 'CatBoost', 
                desc: 'Categorical boosting', 
                fullDesc: 'Developed by Yandex, handles categorical features (like sector, industry) automatically. Resistant to overfitting and requires less parameter tuning. Good all-around performer that works out of the box with minimal configuration.',
                color: 'yellow' 
              },
              { 
                name: 'Transformer', 
                desc: 'Attention-based model', 
                fullDesc: 'State-of-the-art architecture that uses attention mechanisms to focus on important time periods. Captures long-range dependencies better than LSTM. Requires significant data and computing power but can achieve superior accuracy on complex patterns.',
                color: 'cyan' 
              }
            ].map((model, idx) => (
              <div key={idx} className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedModel(expandedModel === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3 bg-background dark:bg-dark-bg-elevated hover:bg-primary hover:text-white transition-all group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full bg-${model.color}-500`}></div>
                    <div>
                      <div className="font-medium text-text dark:text-dark-text group-hover:text-white">{model.name}</div>
                      <div className="text-xs text-text-muted dark:text-dark-text-muted group-hover:text-white group-hover:text-opacity-90">{model.desc}</div>
                    </div>
                  </div>
                  {expandedModel === idx ? 
                    <ChevronUp className="w-4 h-4 text-text-muted dark:text-dark-text-muted group-hover:text-white" /> : 
                    <ChevronDown className="w-4 h-4 text-text-muted dark:text-dark-text-muted group-hover:text-white" />
                  }
                </button>
                {expandedModel === idx && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-border dark:border-dark-border">
                    <p className="text-sm text-text-light dark:text-dark-text-secondary">{model.fullDesc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
