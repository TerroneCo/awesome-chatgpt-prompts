import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <Hero />
      <Dashboard />
    </div>
  )
}

export default App