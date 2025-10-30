import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import axios from 'axios'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStrategies: 5,
    totalModels: 5,
    activeAnalyses: 0,
    successRate: 0
  })

  return (
    <div className="space-y-8">
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
        <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text mb-1">{stats.totalStrategies}</div>
          <div className="text-sm text-text-light">Trading Strategies</div>
          <div className="text-xs text-text-muted mt-2">Available for analysis</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text mb-1">{stats.totalModels}</div>
          <div className="text-sm text-text-light">ML Models</div>
          <div className="text-xs text-text-muted mt-2">Prediction algorithms</div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text mb-1">1000+</div>
          <div className="text-sm text-text-light">Stock Symbols</div>
          <div className="text-xs text-text-muted mt-2">Available for trading</div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-text mb-1">24/7</div>
          <div className="text-sm text-text-light">AI Assistant</div>
          <div className="text-xs text-text-muted mt-2">Always available</div>
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
        <div className="bg-white rounded-xl p-8 shadow-card">
          <h3 className="text-xl font-bold text-text mb-4">Available Strategies</h3>
          <div className="space-y-3">
            {[
              { name: 'EMA Crossover', desc: 'Moving average crossover signals', color: 'blue' },
              { name: 'RSI Strategy', desc: 'Overbought/oversold momentum', color: 'purple' },
              { name: 'MACD Strategy', desc: 'Trend following with MACD', color: 'green' },
              { name: 'Bollinger Scalping', desc: 'Mean reversion trading', color: 'orange' },
              { name: 'SuperTrend', desc: 'ATR-based trend indicator', color: 'red' }
            ].map((strategy, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background-dark transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full bg-${strategy.color}-500`}></div>
                  <div>
                    <div className="font-medium text-text">{strategy.name}</div>
                    <div className="text-xs text-text-muted">{strategy.desc}</div>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-text-muted" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-card">
          <h3 className="text-xl font-bold text-text mb-4">ML Prediction Models</h3>
          <div className="space-y-3">
            {[
              { name: 'LSTM', desc: 'Deep learning time series', color: 'blue' },
              { name: 'Prophet', desc: 'Facebook forecasting model', color: 'purple' },
              { name: 'ARIMA', desc: 'Classical time series', color: 'green' },
              { name: 'Random Forest', desc: 'Ensemble learning', color: 'orange' },
              { name: 'XGBoost', desc: 'Gradient boosting', color: 'red' }
            ].map((model, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background-dark transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full bg-${model.color}-500`}></div>
                  <div>
                    <div className="font-medium text-text">{model.name}</div>
                    <div className="text-xs text-text-muted">{model.desc}</div>
                  </div>
                </div>
                <Activity className="w-4 h-4 text-text-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
