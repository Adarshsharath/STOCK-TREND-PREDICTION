import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Home, LineChart, Brain, BarChart3, Info, Moon, Sun, Activity } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/live-market', label: 'Live Market', icon: Activity },
    { path: '/strategies', label: 'Strategies', icon: LineChart },
    { path: '/predictions', label: 'Predictions', icon: Brain },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info }
  ]

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-border dark:border-gray-700 sticky top-0 z-40 shadow-sm transition-colors">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary-dark transition-colors">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">FinBot</span>
              <span className="text-xs text-text-muted dark:text-gray-400 ml-1 block -mt-1">AI Trading Platform</span>
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
                      ? 'text-primary bg-primary bg-opacity-10 dark:bg-primary dark:bg-opacity-20'
                      : 'text-text-light dark:text-gray-300 hover:text-primary hover:bg-background-dark dark:hover:bg-gray-700'
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
              className="ml-4 p-2 rounded-lg bg-background-dark dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
