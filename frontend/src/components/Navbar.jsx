import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Home, LineChart, Brain, BarChart3, Info, Moon, Sun, IndianRupee, LogOut, User as UserIcon, Menu, X } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path
  
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/finance', label: 'Finance', icon: IndianRupee },
    { path: '/strategies', label: 'Strategies', icon: LineChart },
    { path: '/predictions', label: 'Predictions', icon: Brain },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info }
  ]

  return (
    <nav className="bg-white dark:bg-dark-bg-secondary border-b border-border dark:border-dark-border sticky top-0 z-50 shadow-sm dark:shadow-dark-card transition-colors backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={closeMobileMenu}>
            <div className="bg-gradient-to-r from-primary to-primary-dark p-2 rounded-lg group-hover:shadow-neon transition-all">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-primary dark:text-neon-purple">
                FinSight AI
              </span>
              <span className="text-xs text-text-muted dark:text-dark-text-muted ml-1 block -mt-1 hidden sm:block">AI Trading Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    isActive(link.path)
                      ? 'text-primary dark:text-neon-purple bg-primary bg-opacity-10 dark:bg-dark-bg-elevated dark:shadow-neon'
                      : 'text-text-light dark:text-dark-text-secondary hover:text-primary dark:hover:text-neon-purple hover:bg-background-dark dark:hover:bg-dark-bg-elevated hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-2 p-2.5 rounded-lg bg-background-dark dark:bg-dark-bg-elevated hover:bg-gray-200 dark:hover:shadow-neon transition-all border border-transparent dark:border-dark-border-light"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-neon-orange animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </button>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="ml-2 flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-background-dark dark:bg-dark-bg-elevated rounded-lg border border-transparent dark:border-dark-border-light">
                  <UserIcon className="w-4 h-4 text-primary dark:text-neon-purple" />
                  <span className="text-sm font-medium text-text dark:text-dark-text">{user?.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-transparent dark:border-red-800"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 px-4 py-2 bg-primary dark:bg-neon-purple text-white rounded-lg font-medium text-sm hover:shadow-lg dark:hover:shadow-neon transition-all"
              >
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-background-dark dark:bg-dark-bg-elevated transition-all"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-neon-orange" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-background-dark dark:bg-dark-bg-elevated transition-all"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-text dark:text-white" />
              ) : (
                <Menu className="w-6 h-6 text-text dark:text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-border dark:border-dark-border overflow-hidden bg-white dark:bg-dark-bg-secondary"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive(link.path)
                        ? 'text-primary dark:text-neon-purple bg-primary bg-opacity-10 dark:bg-dark-bg-elevated'
                        : 'text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-bg-elevated'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              
              {/* Mobile User Section */}
              <div className="pt-4 border-t border-border dark:border-dark-border">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-background-dark dark:bg-dark-bg-elevated rounded-lg">
                      <UserIcon className="w-5 h-5 text-primary dark:text-neon-purple" />
                      <span className="text-sm font-medium text-text dark:text-dark-text">{user?.username}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        closeMobileMenu()
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-primary dark:bg-neon-purple text-white rounded-lg font-medium"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
