import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Brain, LineChart, ArrowRight, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-6">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Stock Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Early Detection.
              <br />
              <span className="text-secondary">Better Trading.</span>
            </h1>
            
            <p className="text-xl text-white text-opacity-90 mb-10 max-w-2xl mx-auto">
              FinSight AI combines advanced machine learning with deep learning models to analyze 
              stock data, trading strategies, and market trends for comprehensive risk assessment.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/strategies"
                className="inline-flex items-center space-x-2 bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
              >
                <Activity className="w-5 h-5" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all"
              >
                <LineChart className="w-5 h-5" />
                <span>View Dashboard</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text mb-4">Powerful Trading Tools</h2>
            <p className="text-xl text-text-light max-w-2xl mx-auto">
              Everything you need to make informed trading decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-border rounded-2xl p-8 hover:shadow-card-hover transition-shadow"
            >
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <LineChart className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-text mb-4">Trading Strategies</h3>
              <p className="text-text-light mb-6">
                5 professional trading strategies including EMA Crossover, RSI, MACD, Bollinger Bands, and SuperTrend.
              </p>
              <Link to="/strategies" className="text-primary font-semibold inline-flex items-center space-x-2 hover:underline">
                <span>Explore Strategies</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-border rounded-2xl p-8 hover:shadow-card-hover transition-shadow"
            >
              <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-text mb-4">ML Predictions</h3>
              <p className="text-text-light mb-6">
                Advanced machine learning models: LSTM, Prophet, ARIMA, Random Forest, and XGBoost for price prediction.
              </p>
              <Link to="/predictions" className="text-primary font-semibold inline-flex items-center space-x-2 hover:underline">
                <span>View Predictions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-border rounded-2xl p-8 hover:shadow-card-hover transition-shadow"
            >
              <div className="bg-purple-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-text mb-4">Real-time Data</h3>
              <p className="text-text-light mb-6">
                Live stock data from Yahoo Finance with interactive charts and comprehensive market analysis.
              </p>
              <Link to="/dashboard" className="text-primary font-semibold inline-flex items-center space-x-2 hover:underline">
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">5</div>
              <div className="text-text-light">Trading Strategies</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-secondary mb-2">5</div>
              <div className="text-text-light">ML Models</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-info mb-2">1000+</div>
              <div className="text-text-light">Stock Symbols</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-warning mb-2">24/7</div>
              <div className="text-text-light">AI Assistant</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Trading Smarter?</h2>
            <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of traders using AI-powered insights to make better investment decisions
            </p>
            <Link
              to="/strategies"
              className="inline-flex items-center space-x-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg text-lg"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
