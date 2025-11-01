import React from 'react'
import { TrendingUp, TrendingDown, Target, Percent, DollarSign, Activity } from 'lucide-react'

const ClassificationResult = ({ data, symbol }) => {
  const prediction = data.next_day_prediction
  const isUp = prediction.direction === 'UP'

  return (
    <div className="space-y-6">
      {/* Main Prediction Card */}
      <div className={`rounded-2xl p-8 ${isUp ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white shadow-2xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {isUp ? (
              <TrendingUp className="w-12 h-12" />
            ) : (
              <TrendingDown className="w-12 h-12" />
            )}
            <div>
              <h2 className="text-3xl font-bold">{symbol}</h2>
              <p className="text-white text-opacity-90">Next Day Prediction</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-6xl font-bold ${isUp ? 'text-neon-green' : 'text-red-100'}`}>
              {prediction.direction}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm opacity-75">Current Price</span>
            </div>
            <div className="text-2xl font-bold">₹{prediction.current_price.toFixed(2)}</div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="text-sm opacity-75">Expected Price</span>
            </div>
            <div className="text-2xl font-bold">₹{prediction.expected_price.toFixed(2)}</div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Percent className="w-5 h-5" />
              <span className="text-sm opacity-75">Change</span>
            </div>
            <div className="text-2xl font-bold">
              {prediction.change_percentage > 0 ? '+' : ''}
              {prediction.change_percentage.toFixed(2)}%
            </div>
            <div className="text-sm opacity-75 mt-1">
              {prediction.expected_change > 0 ? '+' : ''}₹{prediction.expected_change.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
        <h3 className="text-lg font-bold text-text dark:text-dark-text-primary mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-primary" />
          Model Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="text-sm text-text-muted dark:text-dark-text-muted mb-1">Accuracy</div>
            <div className="text-2xl font-bold text-primary dark:text-neon-purple">
              {data.metrics.accuracy.toFixed(1)}%
            </div>
          </div>

          <div className="bg-background dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="text-sm text-text-muted dark:text-dark-text-muted mb-1">Precision</div>
            <div className="text-2xl font-bold text-secondary dark:text-neon-green">
              {data.metrics.precision.toFixed(1)}%
            </div>
          </div>

          <div className="bg-background dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="text-sm text-text-muted dark:text-dark-text-muted mb-1">Recall</div>
            <div className="text-2xl font-bold text-info dark:text-neon-blue">
              {data.metrics.recall.toFixed(1)}%
            </div>
          </div>

          <div className="bg-background dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="text-sm text-text-muted dark:text-dark-text-muted mb-1">F1 Score</div>
            <div className="text-2xl font-bold text-warning dark:text-neon-orange">
              {data.metrics.f1_score.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix */}
      {data.metrics.confusion_matrix && (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
          <h3 className="text-lg font-bold text-text dark:text-dark-text-primary mb-4">Confusion Matrix</h3>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-2 border-green-500 rounded-lg p-4 text-center">
              <div className="text-xs text-green-700 dark:text-green-300 mb-1">True Positive</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {data.metrics.confusion_matrix[1][1]}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 border-2 border-orange-400 rounded-lg p-4 text-center">
              <div className="text-xs text-orange-700 dark:text-orange-300 mb-1">False Positive</div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {data.metrics.confusion_matrix[0][1]}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 border-2 border-orange-400 rounded-lg p-4 text-center">
              <div className="text-xs text-orange-700 dark:text-orange-300 mb-1">False Negative</div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {data.metrics.confusion_matrix[1][0]}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border-2 border-green-500 rounded-lg p-4 text-center">
              <div className="text-xs text-green-700 dark:text-green-300 mb-1">True Negative</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {data.metrics.confusion_matrix[0][0]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance (if available) */}
      {data.feature_importance && Object.keys(data.feature_importance).length > 0 && (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
          <h3 className="text-lg font-bold text-text dark:text-dark-text-primary mb-4">Top Features</h3>
          <div className="space-y-3">
            {Object.entries(data.feature_importance).map(([feature, importance], idx) => (
              <div key={feature} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary dark:bg-neon-purple flex items-center justify-center text-white text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text dark:text-dark-text-primary">{feature}</span>
                    <span className="text-sm text-text-muted dark:text-dark-text-muted">
                      {Math.abs(importance).toFixed(4)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
                    <div
                      className="bg-primary dark:bg-neon-purple h-2 rounded-full"
                      style={{ width: `${(Math.abs(importance) / Math.max(...Object.values(data.feature_importance).map(Math.abs))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Info */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
        <h3 className="text-lg font-bold text-text dark:text-dark-text-primary mb-2">{data.metadata.name}</h3>
        <p className="text-sm text-text-light dark:text-dark-text-secondary mb-4">{data.metadata.description}</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data.metadata.parameters).map(([key, value]) => (
            <span key={key} className="px-3 py-1 bg-background dark:bg-dark-bg-tertiary rounded-full text-xs text-text-muted dark:text-dark-text-muted">
              {key}: {value}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ClassificationResult
