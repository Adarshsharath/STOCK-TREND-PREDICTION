import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TrendingUp, Home, LineChart, Brain, BarChart3, Info } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/strategies', label: 'Strategies', icon: LineChart },
    { path: '/predictions', label: 'Predictions', icon: Brain },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/about', label: 'About', icon: Info }
  ]

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary-dark transition-colors">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-primary">FinBot</span>
              <span className="text-xs text-text-muted ml-1 block -mt-1">AI Trading Platform</span>
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
                      ? 'text-primary bg-primary bg-opacity-10'
                      : 'text-text-light hover:text-primary hover:bg-background-dark'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
