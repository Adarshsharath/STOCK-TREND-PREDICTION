import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Calendar, Loader2, Moon, Sun as SunIcon, Star } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { API_URL } from '../config'

const AstroPopup = ({ isOpen, onClose, onToggle }) => {
  const { isDark } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const [astroEnabled, setAstroEnabled] = useState(false)
  const [showDobInput, setShowDobInput] = useState(false)
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [astroData, setAstroData] = useState(null)
  const [error, setError] = useState('')

  // Load saved astro preference from localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedAstro = localStorage.getItem(`astro_enabled_${user.username}`)
      const savedDob = localStorage.getItem(`astro_dob_${user.username}`)
      const savedData = localStorage.getItem(`astro_data_${user.username}`)
      
      if (savedAstro === 'true') {
        setAstroEnabled(true)
        if (savedDob) {
          setDob(savedDob)
        }
        if (savedData) {
          setAstroData(JSON.parse(savedData))
        }
      }
    }
  }, [isAuthenticated, user])

  const handleToggleAstro = () => {
    if (!astroEnabled) {
      // Enabling astro - show DOB input
      setShowDobInput(true)
      setAstroEnabled(true)
    } else {
      // Disabling astro - clear everything
      setAstroEnabled(false)
      setShowDobInput(false)
      setDob('')
      setAstroData(null)
      setError('')
      if (user) {
        localStorage.removeItem(`astro_enabled_${user.username}`)
        localStorage.removeItem(`astro_dob_${user.username}`)
        localStorage.removeItem(`astro_data_${user.username}`)
      }
    }
  }

  const handleSubmitDob = async () => {
    if (!dob) {
      setError('Please enter your date of birth')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/astrology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ dob })
      })

      const data = await response.json()

      if (response.ok) {
        setAstroData(data)
        setShowDobInput(false)
        
        // Save to localStorage
        if (user) {
          localStorage.setItem(`astro_enabled_${user.username}`, 'true')
          localStorage.setItem(`astro_dob_${user.username}`, dob)
          localStorage.setItem(`astro_data_${user.username}`, JSON.stringify(data))
        }
      } else {
        setError(data.error || 'Failed to fetch astrology data')
        setAstroEnabled(false)
      }
    } catch (err) {
      console.error('Astrology API error:', err)
      setError('Network error. Please try again.')
      setAstroEnabled(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      {isAuthenticated && (
        <motion.button
          onClick={onToggle}
          className="fixed top-24 right-6 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white p-0 rounded-full shadow-2xl transition-all w-14 h-14 z-[9998]"
          style={{
            boxShadow: '0 10px 40px rgba(147, 51, 234, 0.6)'
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              '0 10px 40px rgba(147, 51, 234, 0.6)',
              '0 10px 50px rgba(147, 51, 234, 0.8)',
              '0 10px 40px rgba(147, 51, 234, 0.6)'
            ]
          }}
          transition={{
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          title="FinAstro - Astrology Insights"
        >
          <div className="w-full h-full flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          
          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.button>
      )}

      {/* Popup Window */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 50, y: -20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 20 }}
              className="fixed top-24 right-24 z-[9998] w-[360px] max-h-[calc(100vh-7rem)] overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(147, 51, 234, 0.4)'
              }}
            >
            <div className="bg-white dark:bg-dark-bg-secondary border-2 border-purple-200 dark:border-purple-800/50 rounded-2xl shadow-2xl dark:shadow-dark-card h-full flex flex-col">
              {/* Header */}
              <div className="relative p-6 pb-4 border-b border-gray-200 dark:border-dark-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-neon-purple dark:to-neon-pink rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Welcome to FinAstro
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-dark-text-muted mt-0.5">
                        Enable astrology-based insights for your trading dashboard
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-elevated transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-dark-text-muted" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Toggle Section */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white dark:bg-dark-bg-elevated rounded-lg">
                      <Moon className="w-5 h-5 text-purple-600 dark:text-neon-purple" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Astro Insights
                      </p>
                      <p className="text-xs text-gray-600 dark:text-dark-text-muted">
                        {astroEnabled ? 'Active' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Toggle Button */}
                  <button
                    onClick={handleToggleAstro}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg-secondary ${
                      astroEnabled 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 dark:from-neon-purple dark:to-neon-pink' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                        astroEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    >
                      {astroEnabled && (
                        <Star className="w-4 h-4 text-purple-500 m-1" />
                      )}
                    </span>
                  </button>
                </div>

                {/* DOB Input Section */}
                {astroEnabled && showDobInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                        <Calendar className="w-4 h-4 inline mr-1.5" />
                        Enter Your Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg-elevated border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white transition-all"
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-muted">
                        Only your birth date is required. Time and location will use defaults for approximate insights.
                      </p>
                    </div>

                    {/* Info about defaults used */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                          ℹ️ Default Values Applied
                        </p>
                        <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                          <p>• <span className="font-medium">Time:</span> 12:00 PM (noon)</p>
                          <p>• <span className="font-medium">Location:</span> 20.5937°N, 78.9629°E (India center)</p>
                          <p>• <span className="font-medium">Timezone:</span> IST (UTC+5.5)</p>
                          <p>• <span className="font-medium">Settings:</span> Topocentric observation, Lahiri ayanamsha</p>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-400 italic mt-2">
                          Results may be approximate since full birth details are not provided.
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleSubmitDob}
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-neon-purple dark:to-neon-pink text-white font-medium rounded-lg hover:shadow-lg dark:hover:shadow-neon transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Fetching Insights...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Get Astro Insights</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {/* Astrology Data Display */}
                {astroEnabled && !showDobInput && astroData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Suggestion Card */}
                    <div className="p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-indigo-900/30 rounded-xl border border-purple-200 dark:border-purple-800/30">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white dark:bg-dark-bg-elevated rounded-lg mt-0.5">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-neon-purple" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-purple-600 dark:text-neon-purple mb-1">
                            Today's Guidance
                          </p>
                          <p className="text-sm text-gray-700 dark:text-dark-text leading-relaxed">
                            {astroData.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Key Astro Info */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-600 dark:text-dark-text-muted uppercase tracking-wide">
                        Key Astrological Info
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {astroData.keyInfo && Object.entries(astroData.keyInfo).map(([key, value]) => (
                          <div
                            key={key}
                            className="p-3 bg-white dark:bg-dark-bg-elevated rounded-lg border border-gray-200 dark:border-dark-border"
                          >
                            <p className="text-xs text-gray-500 dark:text-dark-text-muted mb-1 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-800 dark:text-yellow-400">
                        <span className="font-semibold">⚠️ Important Disclaimer:</span>
                      </p>
                      <p className="text-xs text-yellow-800 dark:text-yellow-400 mt-1">
                        Astro results are approximate because full birth details (exact time, location) were not provided. 
                        This is for general guidance only and NOT financial advice. Always make trading decisions based on your own research and risk assessment.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* When Astro is OFF */}
                {!astroEnabled && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-bg-elevated rounded-full mb-4">
                      <Moon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-dark-text-muted">
                      Enable Astro Insights to receive personalized guidance based on astrological data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AstroPopup
