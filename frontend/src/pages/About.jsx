import React from 'react'
import { Info, Shield, Zap, Target } from 'lucide-react'

const About = () => {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <Info className="w-6 h-6" />
          <span className="text-sm font-medium">About FinSight AI</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">About Our Platform</h1>
        <p className="text-white text-opacity-90">
          Learn more about FinSight AI and our mission to democratize trading intelligence
        </p>
      </div>

      {/* Mission */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-8 shadow-card dark:shadow-dark-card">
        <h2 className="text-3xl font-bold text-text dark:text-dark-text mb-4">Our Mission</h2>
        <p className="text-lg text-text-light dark:text-dark-text-secondary leading-relaxed">
          FinSight AI is dedicated to empowering traders and investors with cutting-edge artificial intelligence 
          and machine learning tools. We combine advanced technical analysis strategies with state-of-the-art 
          prediction models to provide comprehensive market insights that help you make informed trading decisions.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-text dark:text-dark-text mb-2">Reliable</h3>
          <p className="text-text-light dark:text-dark-text-secondary">
            Built on proven trading strategies and validated ML models with high accuracy rates.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-text dark:text-dark-text mb-2">Fast</h3>
          <p className="text-text-light dark:text-dark-text-secondary">
            Real-time data processing and instant analysis with optimized algorithms.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-6 shadow-card dark:shadow-dark-card">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-text dark:text-dark-text mb-2">Accurate</h3>
          <p className="text-text-light dark:text-dark-text-secondary">
            Advanced ML models trained on extensive historical data for precise predictions.
          </p>
        </div>
      </div>

      {/* Technology */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl p-8 shadow-card dark:shadow-dark-card">
        <h2 className="text-3xl font-bold text-text dark:text-dark-text mb-6">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-4">Frontend</h3>
            <ul className="space-y-2 text-text-light dark:text-dark-text-secondary">
              <li>• React 18 - Modern UI framework</li>
              <li>• TailwindCSS - Utility-first styling</li>
              <li>• Plotly.js - Interactive charts</li>
              <li>• Framer Motion - Smooth animations</li>
              <li>• Axios - HTTP client</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text dark:text-dark-text mb-4">Backend</h3>
            <ul className="space-y-2 text-text-light dark:text-dark-text-secondary">
              <li>• Flask - Python web framework</li>
              <li>• yfinance - Stock data API</li>
              <li>• TensorFlow - Deep learning</li>
              <li>• scikit-learn - ML algorithms</li>
              <li>• Prophet - Time series forecasting</li>
              <li>• XGBoost - Gradient boosting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-neon-orange rounded-xl p-6">
        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-300 mb-2">⚠️ Important Disclaimer</h3>
        <p className="text-yellow-800 dark:text-yellow-200">
          This application is for <strong>educational and informational purposes only</strong>. 
          It should not be considered financial advice. Always do your own research and consult 
          with a qualified financial advisor before making investment decisions. Past performance 
          does not guarantee future results.
        </p>
      </div>
    </div>
  )
}

export default About
