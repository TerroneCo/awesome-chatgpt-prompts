import React, { useState, useEffect } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { Search, Plus, Minus, Save, Play, X, ChevronDown, ChevronRight } from 'lucide-react'
import PromptLibrary from './PromptLibrary'
import WorkflowCanvas from './WorkflowCanvas'
import PromptNode from './PromptNode'

const WorkflowBuilder = () => {
  const [prompts, setPrompts] = useState([])
  const [filteredPrompts, setFilteredPrompts] = useState([])
  const [dataSources] = useState([
    {
      id: 'clay-table',
      title: 'Clay Table',
      type: 'data-source',
      category: 'Clay',
      description: 'Import enriched company data from Clay tables',
      icon: 'database',
      brandColor: '#FF6B35',
      fields: ['Company Name', 'Industry', 'Employee Count', 'Website', 'Revenue'],
      isRealtime: false
    },
    {
      id: 'hubspot-contacts',
      title: 'HubSpot Contacts',
      type: 'data-source',
      category: 'HubSpot',
      description: 'Sync contacts and deals from HubSpot CRM',
      icon: 'users',
      brandColor: '#FF7A59',
      fields: ['Contact Name', 'Email', 'Company', 'Deal Stage', 'Last Activity'],
      isRealtime: false
    },
    {
      id: 'salesforce-leads',
      title: 'Salesforce Leads',
      type: 'data-source',
      category: 'Salesforce',
      description: 'Import leads and opportunities from Salesforce',
      icon: 'briefcase',
      brandColor: '#00A1E0',
      fields: ['Lead Name', 'Company', 'Status', 'Source', 'Score'],
      isRealtime: false
    },
    {
      id: 'webhook-trigger',
      title: 'Webhook Trigger',
      type: 'data-source',
      category: 'Real-time',
      description: 'Receive real-time data via webhook endpoints',
      icon: 'zap',
      brandColor: '#8B5CF6',
      fields: ['Dynamic Payload', 'Timestamp', 'Source IP', 'Event Type'],
      isRealtime: true,
      webhookUrl: 'https://api.promptflow.com/webhook/abc123'
    },
    {
      id: 'csv-upload',
      title: 'CSV Upload',
      type: 'data-source',
      category: 'File',
      description: 'Upload and process CSV data files',
      icon: 'file-text',
      brandColor: '#10B981',
      fields: ['Dynamic Headers', 'Row Count', 'File Size', 'Upload Date'],
      isRealtime: false
    }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [canvasNodes, setCanvasNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState(null)
  const [tempConnection, setTempConnection] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [draggedPrompt, setDraggedPrompt] = useState(null)
  const [selectedConnection, setSelectedConnection] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Parse prompts from actual README data
  useEffect(() => {
    const loadPromptsFromCSV = async () => {
      try {
        const response = await fetch('/prompts.csv')
        const csvText = await response.text()
        
        // Parse CSV data
        const lines = csvText.split('\n')
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
        
        const parsedPrompts = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            // Handle CSV parsing with quoted fields
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
            const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'))
            
            if (cleanValues.length >= 2) {
              const title = cleanValues[0] || `Prompt ${index + 1}`
              const content = cleanValues[1] || ''
              
              // Extract category from title or content
              let category = 'General'
              if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('code') || title.toLowerCase().includes('programming')) {
                category = 'Development'
              } else if (title.toLowerCase().includes('writer') || title.toLowerCase().includes('content') || title.toLowerCase().includes('essay')) {
                category = 'Writing'
              } else if (title.toLowerCase().includes('teacher') || title.toLowerCase().includes('tutor') || title.toLowerCase().includes('explain')) {
                category = 'Education'
              } else if (title.toLowerCase().includes('business') || title.toLowerCase().includes('consultant') || title.toLowerCase().includes('analyst')) {
                category = 'Business'
              } else if (title.toLowerCase().includes('creative') || title.toLowerCase().includes('artist') || title.toLowerCase().includes('design')) {
                category = 'Creative'
              }
              
              return {
                id: index + 1,
                title: title.replace(/^Act as (?:a |an )?/i, ''),
                category,
                description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                content: content
              }
            }
            return null
          })
          .filter(Boolean)
        
        setPrompts(parsedPrompts)
        setFilteredPrompts(parsedPrompts)
      } catch (error) {
        console.error('Error loading prompts:', error)
        // Fallback to a few sample prompts if CSV fails to load
        const fallbackPrompts = [
          {
            id: 1,
            title: "Linux Terminal",
            category: "Development",
            description: "Act as a linux terminal and execute commands",
            content: "I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show."
          },
          {
            id: 2,
            title: "English Translator",
            category: "Language",
            description: "Translate and improve English text",
            content: "I want you to act as an English translator, spelling corrector and improver."
          }
        ]
        setPrompts(fallbackPrompts)
        setFilteredPrompts(fallbackPrompts)
      }
    }
    
    loadPromptsFromCSV()
  }, [])

  // Filter prompts based on search and category
  useEffect(() => {
    let filtered = prompts

    if (searchTerm) {
      filtered = filtered.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory)
    }

    setFilteredPrompts(filtered)
  }, [prompts, searchTerm, selectedCategory])

  const categories = ['all', ...new Set(prompts.map(p => p.category))]

  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    
    // Find the item being dragged (prompt or data source)
    const prompt = prompts.find(p => p.id.toString() === active.id)
    const dataSource = dataSources.find(ds => ds.id === active.id)
    setDraggedPrompt(prompt || dataSource)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (over && over.id === 'canvas-drop-zone') {
      const prompt = prompts.find(p => p.id.toString() === active.id)
      const dataSource = dataSources.find(ds => ds.id === active.id)
      const item = prompt || dataSource
      
      if (item) {
        // Create a new node on the canvas
        const newNode = {
          id: `node-${Date.now()}`,
          promptId: item.id,
          title: item.title,
          category: item.category,
          content: item.description || item.content,
          type: item.type || 'prompt',
          brandColor: item.brandColor,
          icon: item.icon,
          fields: item.fields,
          isRealtime: item.isRealtime,
          webhookUrl: item.webhookUrl,
          position: { x: 100, y: 100 },
          size: item.type === 'data-source' ? { width: 280, height: 160 } : { width: 300, height: 200 },
          isCollapsed: false
        }
        setCanvasNodes(prev => [...prev, newNode])
      }
    }
    
    setActiveId(null)
    setDraggedPrompt(null)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }

  const handleDeleteNode = (nodeId) => {
    setCanvasNodes(prev => prev.filter(node => node.id !== nodeId))
  }

  const handleUpdateNode = (nodeId, updates) => {
    setCanvasNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ))
    
    // Update connection positions when nodes move
    if (updates.position) {
      setConnections(prev => prev.map(connection => {
        const updatedConnection = { ...connection }
        
        // Update connection positions based on node movement
        if (connection.from === nodeId) {
          const updatedNode = canvasNodes.find(n => n.id === nodeId)
          if (updatedNode) {
            const newNode = { ...updatedNode, ...updates }
            updatedConnection.fromPosition = {
              x: newNode.position.x + newNode.size.width,
              y: newNode.position.y + newNode.size.height / 2
            }
          }
        }
        
        if (connection.to === nodeId) {
          const updatedNode = canvasNodes.find(n => n.id === nodeId)
          if (updatedNode) {
            const newNode = { ...updatedNode, ...updates }
            updatedConnection.toPosition = {
              x: newNode.position.x,
              y: newNode.position.y + newNode.size.height / 2
            }
          }
        }
        
        return updatedConnection
      }))
    }
  }

  const handleConnectionStart = (nodeId, type, position) => {
    setIsConnecting(true)
    setConnectionStart({ nodeId, type, position })
  }

  const handleConnectionEnd = (nodeId, type, position) => {
    if (isConnecting && connectionStart) {
      // Validate connection
      if (connectionStart.nodeId !== nodeId && 
          connectionStart.type !== type &&
          connectionStart.type === 'output' && type === 'input') {
        
        // Check if connection already exists
        const existingConnection = connections.find(conn => 
          conn.from === connectionStart.nodeId && conn.to === nodeId
        )
        
        if (!existingConnection) {
          const newConnection = {
            id: `conn-${Date.now()}`,
            from: connectionStart.nodeId,
            to: nodeId,
            fromPosition: connectionStart.position,
            toPosition: position
          }
          setConnections(prev => [...prev, newConnection])
        }
      }
    }
    
    setIsConnecting(false)
    setConnectionStart(null)
    setTempConnection(null)
  }

  const handleConnectionCancel = () => {
    setIsConnecting(false)
    setConnectionStart(null)
    setTempConnection(null)
  }

  const handleConnectionSelect = (connectionId) => {
    setSelectedConnection(connectionId)
  }

  const handleConnectionDelete = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
    setSelectedConnection(null)
  }

  // Handle keyboard events for deleting selected connections
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedConnection) {
        e.preventDefault()
        handleConnectionDelete(selectedConnection)
      }
      if (e.key === 'Escape') {
        setSelectedConnection(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedConnection])

  const handleMouseMove = (e) => {
    if (isConnecting && connectionStart) {
      const canvasRect = document.querySelector('.workflow-canvas').getBoundingClientRect()
      const x = (e.clientX - canvasRect.left) / zoomLevel
      const y = (e.clientY - canvasRect.top) / zoomLevel
      
      setTempConnection({
        from: connectionStart.position,
        to: { x, y }
      })
    }
  }

  useEffect(() => {
    if (isConnecting) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('click', handleConnectionCancel)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('click', handleConnectionCancel)
      }
    }
  }, [isConnecting, connectionStart, zoomLevel])

  return (
    <div className="h-screen flex bg-dark-900 pt-16">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Left Sidebar - Prompt Library */}
        <div className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col">
          {/* Data Sources Section */}
          <div className="border-b border-dark-700">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <span>Data Sources</span>
              </h2>
            </div>
            
            <div className="px-4 pb-4 space-y-2">
              {dataSources.map((dataSource) => (
                <DataSourceCard key={dataSource.id} dataSource={dataSource} />
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-white mb-4">Prompt Library</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt List */}
          <PromptLibrary prompts={filteredPrompts} />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="h-14 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-white">Workflow Builder</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <Minus className="h-4 w-4 text-white" />
                </button>
                <span className="text-sm text-slate-400 min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4 text-white" />
                </button>
              </div>

              {/* Action Buttons */}
              <button className="btn-secondary flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Run</span>
              </button>
            </div>
          </div>

          {/* Canvas */}
          <WorkflowCanvas
            nodes={canvasNodes}
            zoomLevel={zoomLevel}
            connections={connections}
            tempConnection={tempConnection}
            selectedConnection={selectedConnection}
            onDeleteNode={handleDeleteNode}
            onUpdateNode={handleUpdateNode}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onConnectionSelect={handleConnectionSelect}
            onConnectionDelete={handleConnectionDelete}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedPrompt ? (
            <div className={`${
              draggedPrompt.type === 'data-source' 
                ? 'bg-gradient-to-br from-dark-700 to-dark-800 border-2 rounded-lg' 
                : 'bg-dark-700 border border-primary-500 rounded-lg'
            } p-3 shadow-xl opacity-90 max-w-xs`}
            style={draggedPrompt.type === 'data-source' ? {
              borderColor: draggedPrompt.brandColor,
              boxShadow: `0 0 20px ${draggedPrompt.brandColor}40`
            } : {}}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {draggedPrompt.type === 'data-source' && (
                    <div className="p-1 rounded" style={{ backgroundColor: `${draggedPrompt.brandColor}20` }}>
                      <DataSourceIcon icon={draggedPrompt.icon} color={draggedPrompt.brandColor} size={16} />
                    </div>
                  )}
                  <h3 className="font-medium text-white text-sm">{draggedPrompt.title}</h3>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  draggedPrompt.type === 'data-source' 
                    ? 'text-white' 
                    : 'bg-primary-500/20 text-primary-300'
                }`}
                style={draggedPrompt.type === 'data-source' ? {
                  backgroundColor: `${draggedPrompt.brandColor}40`,
                  color: draggedPrompt.brandColor
                } : {}}>
                  {draggedPrompt.category}
                </span>
              </div>
              {draggedPrompt.isRealtime && (
                <div className="mb-2">
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                    Real-time
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-400 line-clamp-2">
                {draggedPrompt.description}
              </p>
              {draggedPrompt.fields && (
                <div className="mt-2">
                  <span className="text-xs text-slate-500">
                    {draggedPrompt.fields.length} fields
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default WorkflowBuilder