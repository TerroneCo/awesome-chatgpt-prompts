import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock, Star, Workflow, FileText, Zap, ArrowRight, Sparkles } from 'lucide-react'

const Dashboard = () => {
  const recentWorkflows = []

  const popularTemplates = [
    {
      id: 1,
      title: 'Content Creation Pipeline',
      description: 'Generate, review, and publish content automatically',
      icon: FileText,
      category: 'Content',
      uses: 1200,
      rating: 4.8
    },
    {
      id: 2,
      title: 'Data Analysis Workflow',
      description: 'Analyze data, generate insights, and create reports',
      icon: Sparkles,
      category: 'Analytics',
      uses: 890,
      rating: 4.9
    },
    {
      id: 3,
      title: 'Customer Support Bot',
      description: 'Automated customer support with escalation rules',
      icon: Zap,
      category: 'Support',
      uses: 2100,
      rating: 4.7
    },
    {
      id: 4,
      title: 'Code Review Assistant',
      description: 'Automated code review and improvement suggestions',
      icon: Workflow,
      category: 'Development',
      uses: 650,
      rating: 4.6
    }
  ]

  return (
    <section className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Your Workflow Dashboard
            </span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start building powerful AI workflows or explore our curated templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create New Workflow - Prominent CTA */}
          <div className="lg:col-span-1">
            <div className="card card-hover bg-gradient-to-br from-primary-600/10 to-secondary-600/10 border-primary-500/20 h-full">
              <div className="text-center">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Create New Workflow
                </h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Start from scratch and build a custom AI workflow tailored to your specific needs
                </p>
                <Link to="/workflow-builder" className="btn-primary w-full flex items-center justify-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Workflows */}
          <div className="lg:col-span-2">
            <div className="card h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-primary-400" />
                  <h3 className="text-xl font-semibold text-white">Recent Workflows</h3>
                </div>
                <button className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                  View All
                </button>
              </div>

              {recentWorkflows.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-dark-700 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Workflow className="h-8 w-8 text-slate-500" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-300 mb-2">No workflows yet</h4>
                  <p className="text-slate-500 mb-6">
                    Create your first workflow to get started with AI automation
                  </p>
                  <button className="btn-secondary">
                    Browse Templates
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recent workflows would be rendered here */}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Templates */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Star className="h-6 w-6 text-secondary-400" />
              <h3 className="text-2xl font-bold text-white">Popular Templates</h3>
            </div>
            <button className="text-secondary-400 hover:text-secondary-300 text-sm font-medium transition-colors">
              View All Templates
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTemplates.map((template) => {
              const IconComponent = template.icon
              return (
                <div key={template.id} className="card card-hover cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 p-3 rounded-lg group-hover:from-primary-500/20 group-hover:to-secondary-500/20 transition-all duration-200">
                      <IconComponent className="h-6 w-6 text-primary-400" />
                    </div>
                    <span className="text-xs bg-dark-700 text-slate-400 px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-white mb-2 group-hover:text-primary-300 transition-colors">
                    {template.title}
                  </h4>
                  
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-4">
                      <span>{template.uses.toLocaleString()} uses</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard