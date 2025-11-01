import React from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, Brain, Target, TrendingUp, Shield, Zap, 
  Rocket, CheckCircle2, Code2, Database, LineChart, 
  Cpu, Globe, BarChart3
} from 'lucide-react'

const About = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const missionCards = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Leveraging cutting-edge machine learning algorithms and neural networks to analyze market patterns and predict trends with unprecedented accuracy.',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400'
    },
    {
      icon: Target,
      title: 'Precision Trading',
      description: 'Advanced technical analysis combining multiple indicators and strategies to identify optimal entry and exit points for maximum returns.',
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400'
    },
    {
      icon: TrendingUp,
      title: 'Market Democratization',
      description: 'Making sophisticated trading tools accessible to everyone, from beginners to professionals, with intuitive interfaces and real-time insights.',
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-400'
    }
  ]

  const techStack = [
    {
      category: 'Frontend',
      icon: Code2,
      technologies: [
        { name: 'React 18', description: 'Modern UI framework', color: 'text-cyan-400' },
        { name: 'TailwindCSS', description: 'Utility-first styling', color: 'text-sky-400' },
        { name: 'Plotly.js', description: 'Interactive charts', color: 'text-indigo-400' },
        { name: 'Framer Motion', description: 'Smooth animations', color: 'text-purple-400' },
        { name: 'Axios', description: 'HTTP client', color: 'text-blue-400' }
      ]
    },
    {
      category: 'Backend',
      icon: Database,
      technologies: [
        { name: 'Flask', description: 'Python web framework', color: 'text-green-400' },
        { name: 'yfinance', description: 'Stock data API', color: 'text-yellow-400' },
        { name: 'TensorFlow', description: 'Deep learning', color: 'text-orange-400' },
        { name: 'scikit-learn', description: 'ML algorithms', color: 'text-amber-400' },
        { name: 'Prophet', description: 'Time series forecasting', color: 'text-teal-400' }
      ]
    },
    {
      category: 'AI Models',
      icon: Cpu,
      technologies: [
        { name: 'LSTM Networks', description: 'Sequential prediction', color: 'text-rose-400' },
        { name: 'XGBoost', description: 'Gradient boosting', color: 'text-pink-400' },
        { name: 'Random Forest', description: 'Ensemble learning', color: 'text-fuchsia-400' },
        { name: 'Prophet', description: 'Facebook\'s forecaster', color: 'text-violet-400' },
        { name: 'Linear Regression', description: 'Baseline model', color: 'text-cyan-400' },
        { name: 'GRU Networks', description: 'Advanced RNN', color: 'text-blue-400' },
        { name: 'Ensemble Models', description: 'Multi-model voting', color: 'text-purple-400' },
        { name: 'Technical Indicators', description: '50+ classic strategies', color: 'text-indigo-400' }
      ]
    }
  ]

  const timeline = [
    {
      year: '2024 Q1',
      title: 'Project Inception',
      description: 'FinBot AI concept and initial development began',
      icon: Sparkles,
      status: 'completed'
    },
    {
      year: '2024 Q2',
      title: 'Core ML Models',
      description: 'Developed and trained LSTM, XGBoost, and Prophet models',
      icon: Brain,
      status: 'completed'
    },
    {
      year: '2024 Q3',
      title: 'Platform Launch',
      description: 'Released beta version with real-time predictions',
      icon: Rocket,
      status: 'completed'
    },
    {
      year: '2024 Q4',
      title: 'Advanced Features',
      description: 'Added technical analysis, multi-model ensemble, and enhanced UI',
      icon: LineChart,
      status: 'completed'
    },
    {
      year: '2025 Q1',
      title: 'Global Expansion',
      description: 'International markets support and multi-currency trading',
      icon: Globe,
      status: 'in-progress'
    },
    {
      year: '2025 Q2',
      title: 'Portfolio Analytics',
      description: 'Advanced portfolio management and risk assessment tools',
      icon: BarChart3,
      status: 'upcoming'
    }
  ]

  return (
    <div className="space-y-16 pb-12">
      {/* Gradient Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="relative px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium text-white">About FinBot AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              The Future of
              <br />
              <span 
                className="inline-block"
                style={{
                  background: 'linear-gradient(to right, #fde047, #f9a8d4, #d8b4fe)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Intelligent Trading
              </span>
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Democratizing financial intelligence through cutting-edge AI and machine learning. 
              Making sophisticated trading strategies accessible to everyone.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Mission Cards - Animated */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-3 gap-6"
      >
        {missionCards.map((card, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
              <div className={`${card.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-7 h-7 ${card.iconColor}`} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed">{card.description}</p>
            </div>
            
            {/* Animated border effect */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`}></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Technology Stack</h2>
          <p className="text-gray-400 text-lg">Built with modern, industry-leading technologies</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {techStack.map((stack, stackIndex) => (
            <motion.div
              key={stackIndex}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: stackIndex * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center">
                  <stack.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{stack.category}</h3>
              </div>
              
              <div className="space-y-3">
                {stack.technologies.map((tech, techIndex) => (
                  <motion.div
                    key={techIndex}
                    whileHover={{ x: 8, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-semibold ${tech.color} group-hover:scale-105 transition-transform duration-300 inline-block`}>
                          {tech.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">{tech.description}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Our Journey</h2>
          <p className="text-gray-400 text-lg">Building the future of trading intelligence, one milestone at a time</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start space-x-6 group"
                >
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    item.status === 'completed' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                      : item.status === 'in-progress'
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse'
                      : 'bg-gray-700 border-2 border-gray-600'
                  }`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <motion.div
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 bg-gray-800/50 rounded-xl p-6 border border-gray-700 group-hover:border-gray-600 group-hover:bg-gray-700/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-blue-400 mb-1">{item.year}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      </div>
                      {item.status === 'completed' && (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                      {item.status === 'in-progress' && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                          In Progress
                        </span>
                      )}
                      {item.status === 'upcoming' && (
                        <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs font-semibold rounded-full">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">{item.description}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Values */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300"
        >
          <Shield className="w-12 h-12 text-blue-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Reliable</h3>
          <p className="text-gray-400">
            Built on proven strategies and validated ML models with consistently high accuracy rates.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300"
        >
          <Zap className="w-12 h-12 text-green-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Lightning Fast</h3>
          <p className="text-gray-400">
            Real-time data processing and instant predictions with highly optimized algorithms.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
        >
          <Target className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Precision Focused</h3>
          <p className="text-gray-400">
            Advanced ensemble models trained on extensive historical data for precise market predictions.
          </p>
        </motion.div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Important Disclaimer</span>
        </h3>
        <p className="text-yellow-200/80 leading-relaxed">
          This application is for <strong>educational and informational purposes only</strong>. 
          It should not be considered financial advice. Always do your own research and consult 
          with a qualified financial advisor before making investment decisions. Past performance 
          does not guarantee future results. Trading involves substantial risk of loss.
        </p>
      </motion.div>
    </div>
  )
}

export default About
