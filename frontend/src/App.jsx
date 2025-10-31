import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Strategies from './pages/Strategies'
import Predictions from './pages/Predictions'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Chatbot from './components/Chatbot'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <Router>
          <div className="min-h-screen bg-background dark:bg-gray-900 transition-colors">
          <Navbar />
          <main className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/strategies" element={<Strategies />} />
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
