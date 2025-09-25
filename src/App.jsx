import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import WorkflowBuilder from './components/WorkflowBuilder'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Dashboard />
            </>
          } />
          <Route path="/workflow-builder" element={<WorkflowBuilder />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App