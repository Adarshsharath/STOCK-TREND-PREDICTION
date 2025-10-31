import React from 'react'
import { Brain, Zap, Target, TrendingUp, Award, Clock } from 'lucide-react'

const ModelComparison = ({ currentModel, metrics }) => {
  // Model characteristics data
  const modelInfo = {
    'lstm': {
      name: 'LSTM',
      speed: 2,
      accuracy: 5,
      complexity: 5,
      dataNeeded: 4,
      description: 'Best for long-term predictions with complex patterns',
      strengths: ['Captures long-term dependencies', 'Handles non-linear patterns', 'Best for volatile markets'],
      weaknesses: ['Slowest training time', 'Requires substantial data', 'Computationally intensive'],
      bestFor: 'Long-term trend prediction (weeks/months)',
      trainingTime: '30-90 seconds',
      color: 'purple'
    },
    'prophet': {
      name: 'Prophet',
      speed: 3,
      accuracy: 4,
      complexity: 3,
      dataNeeded: 3,
      description: 'Excellent for data with strong seasonal patterns',
      strengths: ['Handles seasonality well', 'Works with missing data', 'Easy to interpret'],
      weaknesses: ['Less accurate for volatile stocks', 'Requires longer history', 'Limited customization'],
      bestFor: 'Seasonal patterns and trend analysis',
      trainingTime: '10-20 seconds',
      color: 'blue'
    },
    'arima': {
      name: 'ARIMA',
      speed: 5,
      accuracy: 3,
      complexity: 2,
      dataNeeded: 2,
      description: 'Fast and reliable for short-term forecasts',
      strengths: ['Very fast training', 'Good for short-term', 'Minimal data required'],
      weaknesses: ['Limited long-term accuracy', 'Assumes stationarity', 'Basic pattern recognition'],
      bestFor: 'Short-term predictions (days/weeks)',
      trainingTime: '3-8 seconds',
      color: 'green'
    },
    'randomforest': {
      name: 'Random Forest',
      speed: 4,
      accuracy: 4,
      complexity: 3,
      dataNeeded: 3,
      description: 'Balanced performance across different scenarios',
      strengths: ['Robust to overfitting', 'Handles outliers well', 'Good general performance'],
      weaknesses: ['Black box model', 'Can be memory intensive', 'Limited extrapolation'],
      bestFor: 'General purpose prediction',
      trainingTime: '8-15 seconds',
      color: 'orange'
    },
    'xgboost': {
      name: 'XGBoost',
      speed: 4,
      accuracy: 5,
      complexity: 4,
      dataNeeded: 3,
      description: 'High accuracy with efficient training',
      strengths: ['High accuracy', 'Fast training', 'Feature importance tracking'],
      weaknesses: ['Requires parameter tuning', 'Can overfit small datasets', 'Complex interpretation'],
      bestFor: 'High-accuracy predictions',
      trainingTime: '10-20 seconds',
      color: 'red'
    }
  }

  const current = modelInfo[currentModel] || modelInfo['lstm']

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 border-purple-300',
      blue: 'bg-blue-100 text-blue-800 border-blue-300',
      green: 'bg-green-100 text-green-800 border-green-300',
      orange: 'bg-orange-100 text-orange-800 border-orange-300',
      red: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[color] || colors.blue
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < rating ? 'bg-yellow-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-card border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-text dark:text-white">Model Performance Analysis</h3>
          <p className="text-xs text-text-light dark:text-gray-400">Understanding {current.name} characteristics</p>
        </div>
      </div>

      {/* Current Model Highlight */}
      <div className={`border-2 rounded-lg p-4 mb-6 ${getColorClass(current.color)}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xl font-bold">{current.name}</h4>
            <p className="text-sm opacity-90 mt-1">{current.description}</p>
          </div>
          <Award className="w-8 h-8 opacity-50" />
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Speed</span>
              {renderStars(current.speed)}
            </div>
          </div>
          <div className="bg-white bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Accuracy</span>
              {renderStars(current.accuracy)}
            </div>
          </div>
          <div className="bg-white bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Complexity</span>
              {renderStars(current.complexity)}
            </div>
          </div>
          <div className="bg-white bg-opacity-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Data Needed</span>
              {renderStars(current.dataNeeded)}
            </div>
          </div>
        </div>
      </div>

      {/* Current Model Metrics */}
      {metrics && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
            <Target className="w-4 h-4 text-green-600 dark:text-green-400 mb-1" />
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">MAE</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-300">
              {metrics.mae?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1" />
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">RMSE</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
              {metrics.rmse?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-1" />
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Accuracy</p>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
              {metrics.directional_accuracy?.toFixed(1) || 'N/A'}%
            </p>
          </div>
        </div>
      )}

      {/* Best For */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <Zap className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text dark:text-white mb-1">Best Use Case</p>
            <p className="text-sm text-text-light dark:text-gray-300">{current.bestFor}</p>
          </div>
        </div>
      </div>

      {/* Training Time */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-text dark:text-white">Training Time</span>
          </div>
          <span className="text-sm font-bold text-primary">{current.trainingTime}</span>
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-text dark:text-white mb-2 flex items-center space-x-2">
          <span className="text-green-600">✓</span>
          <span>Strengths</span>
        </p>
        <ul className="space-y-1">
          {current.strengths.map((strength, idx) => (
            <li key={idx} className="text-xs text-text-light dark:text-gray-300 flex items-start">
              <span className="text-green-600 mr-2">•</span>
              <span>{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-text dark:text-white mb-2 flex items-center space-x-2">
          <span className="text-orange-600">⚠</span>
          <span>Limitations</span>
        </p>
        <ul className="space-y-1">
          {current.weaknesses.map((weakness, idx) => (
            <li key={idx} className="text-xs text-text-light dark:text-gray-300 flex items-start">
              <span className="text-orange-600 mr-2">•</span>
              <span>{weakness}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Model Comparison Quick View */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-text dark:text-white mb-3">Quick Comparison</p>
        <div className="space-y-2">
          {Object.entries(modelInfo).map(([key, model]) => (
            <div
              key={key}
              className={`flex items-center justify-between p-2 rounded ${
                key === currentModel
                  ? 'bg-primary bg-opacity-10 border border-primary'
                  : 'bg-gray-50 dark:bg-gray-700/30'
              }`}
            >
              <span className={`text-xs font-medium ${
                key === currentModel ? 'text-primary' : 'text-text-light dark:text-gray-400'
              }`}>
                {model.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs">{model.speed}/5</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-green-500" />
                  <span className="text-xs">{model.accuracy}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModelComparison
