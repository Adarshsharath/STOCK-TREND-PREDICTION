import React from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, Brain, LineChart, ArrowRight, Activity, 
  Sparkles, Zap, Shield, BarChart3, Bot, Target 
} from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const stats = [
    { 
      number: '10', 
      label: 'Trading Strategies', 
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    { 
      number: '10', 
      label: 'ML Models', 
      icon: Brain,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    { 
      number: '5000+', 
      label: 'Stock Symbols', 
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    { 
      number: '24/7', 
      label: 'AI Assistant', 
      icon: Bot,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50'
    }
  ]

  const features = [
    {
      icon: LineChart,
      title: 'Advanced Trading Strategies',
      description: '10 professional strategies including EMA, RSI, MACD, Bollinger, SuperTrend, Ichimoku, ADX/DMI, VWAP, and ML-powered signals.',
      link: '/strategies',
      linkText: 'Explore Strategies',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100'
    },
    {
      icon: Brain,
      title: 'Intelligent ML Predictions',
      description: '10 cutting-edge models: LSTM, Prophet, ARIMA, XGBoost, Random Forest, plus classification models for precise market forecasting.',
      link: '/predictions',
      linkText: 'View Predictions',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100'
    },
    {
      icon: Activity,
      title: 'Real-time Market Data',
      description: 'Live market feeds with interactive charts, technical indicators, and comprehensive analysis across global stock markets.',
      link: '/dashboard',
      linkText: 'Open Dashboard',
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Modern Gradient Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative container mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30"
            >
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span className="text-sm font-semibold text-white">AI-Powered Trading Intelligence</span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Trade Smarter with
              <br />
              <span className="inline-block mt-2" style={{
                background: 'linear-gradient(to right, #fef08a, #bef264, #86efac)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                AI-Driven Insights
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              FinSight AI combines 10 advanced trading strategies with 10 powerful ML models 
              to deliver precise predictions, real-time analysis, and intelligent trading signals.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/strategies"
                className="group inline-flex items-center space-x-2 bg-white text-cyan-600 px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                <span>Explore Strategies</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/predictions"
                className="group inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white hover:text-cyan-600 transition-all duration-300"
              >
                <Brain className="w-5 h-5" />
                <span>View Predictions</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#1F2937"/>
          </svg>
        </div>
      </section>

      {/* Stats Section with Hover Animations */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-600"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Powerful Trading Tools
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to make data-driven trading decisions
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 rounded-2xl p-6 hover:border-gray-600 hover:shadow-2xl transition-all duration-300"
              >
                {/* Gradient border effect on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  
                  <Link 
                    to={feature.link} 
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 group-hover:underline"
                  >
                    <span>{feature.linkText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Why Choose FinSight AI?
              </h2>
              <p className="text-lg text-gray-300">
                Built for traders who demand precision and performance
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30"
              >
                <Shield className="w-10 h-10 text-blue-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Battle-Tested</h3>
                <p className="text-sm text-gray-400">
                  Proven strategies validated across multiple market conditions
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30"
              >
                <Zap className="w-10 h-10 text-purple-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-sm text-gray-400">
                  Real-time analysis with sub-second prediction speeds
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/30"
              >
                <Target className="w-10 h-10 text-green-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Precision-Focused</h3>
                <p className="text-sm text-gray-400">
                  Ensemble models for maximum accuracy and reliability
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl p-10 md:p-14 text-center"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Trading?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join smart traders leveraging AI-powered insights for better decisions
              </p>
              <Link
                to="/strategies"
                className="group inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5" />
                <span>Start Trading Smarter</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
