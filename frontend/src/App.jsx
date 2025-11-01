import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Strategies from './pages/Strategies'
import StrategyDetail from './pages/StrategyDetail'
import Predictions from './pages/Predictions'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import LiveMarket from './pages/LiveMarket'
import Finance from './pages/Finance'
import StrategyLearn from './pages/StrategyLearn'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chatbot from './components/Chatbot'
import ProtectedRoute from './components/ProtectedRoute'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ChatProvider>
            <div className="min-h-screen bg-background dark:bg-dark-bg-primary transition-colors">
              <Routes>
                {/* Public routes - no navbar */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
                {/* Routes with navbar */}
                <Route path="/*" element={
                  <>
                    <Navbar />
                    <main className="container mx-auto px-6 py-8">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/finance" element={<Finance />} />
                        <Route path="/live-market" element={<LiveMarket />} />
                        <Route path="/strategies" element={<Strategies />} />
                        <Route path="/strategies/:strategyId" element={<StrategyDetail />} />
                        <Route path="/learn/:strategyId" element={<StrategyLearn />} />
                        <Route path="/predictions" element={<Predictions />} />
                        <Route path="/about" element={<About />} />
                        
                        {/* Protected route */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </main>
                    <Chatbot />
                  </>
                } />
              </Routes>
            </div>
          </ChatProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
