import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Home, LineChart, Brain, BarChart3, Info, Moon, Sun, DollarSign, LogOut, User as UserIcon, Zap } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/finance', label: 'Finance', icon: DollarSign },
    { path: '/strategies', label: 'Strategies', icon: LineChart },
    { path: '/predictions', label: 'Predictions', icon: Brain },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info }
  ]

  return (
    <nav className="bg-white dark:bg-dark-bg-secondary border-b border-border dark:border-dark-border sticky top-0 z-40 shadow-sm dark:shadow-dark-card transition-colors backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-2 rounded-lg group-hover:shadow-neon transition-all">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent dark:from-neon-purple dark:to-neon-blue">
                FinSight AI
              </span>
              <span className="text-xs text-text-muted dark:text-dark-text-muted ml-1 block -mt-1">AI Trading Platform</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(link.path)
                      ? 'text-primary dark:text-neon-purple bg-primary bg-opacity-10 dark:bg-dark-bg-elevated dark:shadow-neon'
                      : 'text-text-light dark:text-dark-text-secondary hover:text-primary dark:hover:text-neon-purple hover:bg-background-dark dark:hover:bg-dark-bg-elevated'
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
              className="ml-4 p-2.5 rounded-lg bg-background-dark dark:bg-dark-bg-elevated hover:bg-gray-200 dark:hover:shadow-neon transition-all border border-transparent dark:border-dark-border-light"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-neon-orange animate-pulse" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* User Section */}
            {isAuthenticated ? (
              <div className="ml-4 flex items-center space-x-3">
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
                className="ml-4 px-4 py-2 bg-primary dark:bg-neon-purple text-white rounded-lg font-medium hover:shadow-lg dark:hover:shadow-neon transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
