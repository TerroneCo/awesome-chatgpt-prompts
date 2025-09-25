import React from 'react'
import { ArrowRight, Sparkles, Workflow, Zap } from 'lucide-react'

const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-dark-900 to-secondary-900/20"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-300">
              Transform your AI workflow
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Build, Chain &
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Automate AI Prompts
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Transform static prompts into powerful workflows. Connect, automate, and scale your AI interactions with our visual workflow builder.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button className="btn-primary flex items-center space-x-2 text-lg px-8 py-4">
              <span>Start Building</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="text-slate-300 hover:text-white font-medium px-8 py-4 border border-dark-700 hover:border-dark-600 rounded-lg transition-all duration-200">
              Watch Demo
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-primary-500/10 p-3 rounded-lg">
                <Workflow className="h-6 w-6 text-primary-400" />
              </div>
              <h3 className="font-semibold text-white">Visual Builder</h3>
              <p className="text-sm text-slate-400 text-center">
                Drag and drop to create complex AI workflows
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-secondary-500/10 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-secondary-400" />
              </div>
              <h3 className="font-semibold text-white">Smart Automation</h3>
              <p className="text-sm text-slate-400 text-center">
                Automate repetitive tasks with intelligent triggers
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-primary-500/10 p-3 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary-400" />
              </div>
              <h3 className="font-semibold text-white">AI-Powered</h3>
              <p className="text-sm text-slate-400 text-center">
                Leverage the latest AI models and capabilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero