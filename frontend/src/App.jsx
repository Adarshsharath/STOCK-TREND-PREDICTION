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
import LiveSimulation from './pages/LiveSimulation'
import Finance from './pages/Finance'
import StrategyLearn from './pages/StrategyLearn'
import Chatbot from './components/Chatbot'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-background dark:bg-dark-bg-primary transition-colors">
          <Navbar />
          <main className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/live-market" element={<LiveMarket />} />
              <Route path="/live-simulation" element={<LiveSimulation />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/strategies/:strategyId" element={<StrategyDetail />} />
              <Route path="/learn/:strategyId" element={<StrategyLearn />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Chatbot />
          </div>
        </Router>
      </ChatProvider>
    </ThemeProvider>
  )
}

export default App
