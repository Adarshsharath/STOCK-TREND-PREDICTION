import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Home, LineChart, Brain, BarChart3, Info, Moon, Sun, IndianRupee, LogOut, User as UserIcon, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const NavbarNew = () => {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/finance', label: 'Finance', icon: IndianRupee },
    { path: '/strategies', label: 'Strategies', icon: LineChart },
    { path: '/predictions', label: 'Predictions', icon: Brain },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info }
  ]

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        bg-dark-bg-glass/80 
        backdrop-blur-heavy 
        border-b border-dark-border 
        sticky top-0 z-50 
        shadow-glass
      "
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="
                bg-gradient-to-br from-finsight-blue-500 via-finsight-teal-500 to-finsight-purple-500 
                p-2.5 rounded-xl 
                shadow-neon-blue
                group-hover:shadow-neon-teal
                transition-all duration-300
              "
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500">
                  FinSight AI
                </span>
                <Sparkles className="w-4 h-4 text-finsight-cyan animate-pulse" />
              </div>
              <span className="text-xs text-dark-text-muted">AI-Powered Trading Intelligence</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.path)
              return (
                <motion.div key={link.path} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={link.path}
                    className={`
                      flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all
                      ${
                        active
                          ? 'bg-gradient-to-r from-finsight-blue-500/20 to-finsight-teal-500/20 border border-finsight-blue-500/50 text-finsight-blue-400 shadow-neon-blue backdrop-blur-glass'
                          : 'text-dark-text-secondary hover:text-finsight-blue-400 hover:bg-dark-bg-elevated/50 hover:border hover:border-dark-border-light backdrop-blur-sm'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:block">{link.label}</span>
                  </Link>
                </motion.div>
              )
            })}
            
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="
                ml-4 p-3 rounded-xl 
                bg-dark-bg-elevated 
                border border-dark-border-light 
                hover:border-finsight-blue-500 
                hover:shadow-neon-blue 
                transition-all duration-300
              "
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-finsight-cyan animate-pulse" />
              ) : (
                <Moon className="w-5 h-5 text-finsight-blue-500" />
              )}
            </motion.button>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="ml-4 flex items-center space-x-3">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="
                    flex items-center space-x-2 px-4 py-2 
                    bg-dark-bg-elevated 
                    border border-dark-border-light 
                    rounded-xl
                    backdrop-blur-glass
                  "
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-finsight-blue-500 to-finsight-teal-500 flex items-center justify-center shadow-neon-blue">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-dark-text-primary">{user?.username}</span>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout}
                  className="
                    p-2.5 rounded-xl 
                    bg-red-500/20 
                    border border-red-500/50 
                    hover:bg-red-500/30 
                    hover:shadow-neon-blue 
                    transition-all
                  "
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                </motion.button>
              </div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="
                    ml-4 px-6 py-2.5 
                    bg-gradient-to-r from-finsight-blue-500 to-finsight-teal-500 
                    text-white rounded-xl font-semibold 
                    shadow-neon-blue 
                    hover:shadow-neon-teal 
                    transition-all duration-300
                  "
                >
                  Login
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default NavbarNew
