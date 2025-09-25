import React, { useState, useEffect } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { Search, Plus, Minus, Save, Play, X, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react'
import PromptLibrary from './PromptLibrary'
import WorkflowCanvas from './WorkflowCanvas'
import PromptNode from './PromptNode'
import ConnectionLayer from './ConnectionLayer'

const WorkflowBuilder = () => {
  const [prompts, setPrompts] = useState([])
  const [filteredPrompts, setFilteredPrompts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [canvasNodes, setCanvasNodes] = useState([])
  const [connections, setConnections] = useState([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState(null)
  const [tempConnection, setTempConnection] = useState(null)
  const [workflowName, setWorkflowName] = useState('Untitled Workflow')
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [draggedPrompt, setDraggedPrompt] = useState(null)

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
    
    // Find the prompt being dragged
    const prompt = prompts.find(p => p.id.toString() === active.id)
    setDraggedPrompt(prompt)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (over && over.id === 'canvas-drop-zone') {
      const prompt = prompts.find(p => p.id.toString() === active.id)
      if (prompt) {
        // Create a new node on the canvas
        const newNode = {
          id: `node-${Date.now()}`,
          promptId: prompt.id,
          title: prompt.title,
          category: prompt.category,
          content: prompt.content,
          position: { x: 100, y: 100 },
          size: { width: 300, height: 200 },
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
  }

  const handleConnectionStart = (nodeId, type, event) => {
    event.stopPropagation()
    setIsConnecting(true)
    setConnectionStart({ nodeId, type })
  }

  const handleConnectionEnd = (nodeId, type, event) => {
    event.stopPropagation()
    
    if (!isConnecting || !connectionStart) return
    
    // Validation rules
    if (connectionStart.nodeId === nodeId) {
      // Can't connect to self
      setIsConnecting(false)
      setConnectionStart(null)
      setTempConnection(null)
      return
    }
    
    if (connectionStart.type === type) {
      // Can't connect same types (output to output, input to input)
      setIsConnecting(false)
      setConnectionStart(null)
      setTempConnection(null)
      return
    }
    
    // Determine source and target
    const sourceNodeId = connectionStart.type === 'output' ? connectionStart.nodeId : nodeId
    const targetNodeId = connectionStart.type === 'output' ? nodeId : connectionStart.nodeId
    
    // Check if connection already exists
    const existingConnection = connections.find(conn => 
      conn.source === sourceNodeId && conn.target === targetNodeId
    )
    
    if (existingConnection) {
      setIsConnecting(false)
      setConnectionStart(null)
      setTempConnection(null)
      return
    }
    
    // Check if source already has a connection (only one output per node)
    const existingOutput = connections.find(conn => conn.source === sourceNodeId)
    if (existingOutput) {
      // Remove existing connection
      setConnections(prev => prev.filter(conn => conn.source !== sourceNodeId))
    }
    
    // Create new connection
    const newConnection = {
      id: `conn-${Date.now()}`,
      source: sourceNodeId,
      target: targetNodeId
    }
    
    setConnections(prev => [...prev, newConnection])
    setIsConnecting(false)
    setConnectionStart(null)
    setTempConnection(null)
  }

  const handleMouseMove = (event) => {
    if (isConnecting && connectionStart) {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - rect.left) / zoomLevel
      const y = (event.clientY - rect.top) / zoomLevel
      
      const sourceNode = canvasNodes.find(n => n.id === connectionStart.nodeId)
      if (sourceNode) {
        const sourceX = connectionStart.type === 'output' 
          ? sourceNode.position.x + sourceNode.size.width 
          : sourceNode.position.x
        const sourceY = sourceNode.position.y + sourceNode.size.height / 2
        
        setTempConnection({
          start: { x: sourceX, y: sourceY },
          end: { x, y }
        })
      }
    }
  }

  const handleCanvasClick = () => {
    if (isConnecting) {
      setIsConnecting(false)
      setConnectionStart(null)
      setTempConnection(null)
    }
  }

  const handleDeleteConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const getExecutionOrder = () => {
    const visited = new Set()
    const order = []
    
    const visit = (nodeId) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      
      // Visit all nodes that this node depends on (inputs)
      const inputConnections = connections.filter(conn => conn.target === nodeId)
      inputConnections.forEach(conn => visit(conn.source))
      
      order.push(nodeId)
    }
    
    // Start with nodes that have no inputs (root nodes)
    const rootNodes = canvasNodes.filter(node => 
      !connections.some(conn => conn.target === node.id)
    )
    
    rootNodes.forEach(node => visit(node.id))
    
    // Visit any remaining unvisited nodes
    canvasNodes.forEach(node => {
      if (!visited.has(node.id)) {
        visit(node.id)
      }
    })
    
    return order
  }

  const handleSaveWorkflow = () => {
    const workflow = {
      name: workflowName,
      nodes: canvasNodes,
      connections: connections,
      executionOrder: getExecutionOrder(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Save to localStorage
    const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]')
    const existingIndex = savedWorkflows.findIndex(w => w.name === workflowName)
    
    if (existingIndex >= 0) {
      savedWorkflows[existingIndex] = workflow
    } else {
      savedWorkflows.push(workflow)
    }
    
    localStorage.setItem('workflows', JSON.stringify(savedWorkflows))
    
    // Show success message
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 3000)
  }

  const handleRunWorkflow = () => {
    const executionOrder = getExecutionOrder()
    console.log('Workflow execution order:', executionOrder)
    console.log('Nodes:', canvasNodes)
    console.log('Connections:', connections)
    
    // TODO: Implement actual workflow execution
    alert(`Workflow "${workflowName}" would execute ${executionOrder.length} nodes in order: ${executionOrder.join(' → ')}`)
  }
  return (
    <div className="h-screen flex bg-dark-900 pt-16">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Left Sidebar - Prompt Library */}
        <div className="w-80 bg-dark-800 border-r border-dark-700 flex flex-col">
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
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow Name"
              />
              {showSaveSuccess && (
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Saved!</span>
                </div>
              )}
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
              <button 
                onClick={handleSaveWorkflow}
                className="btn-secondary flex items-center space-x-2"
              >
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
            connections={connections}
            tempConnection={tempConnection}
            executionOrder={executionOrder}
            zoomLevel={zoomLevel}
            onDeleteNode={handleDeleteNode}
            onUpdateNode={handleUpdateNode}
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onDeleteConnection={handleDeleteConnection}
            onCanvasClick={handleCanvasClick}
            onRunNode={handleRunNode}
          />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedPrompt ? (
            <div className="bg-dark-700 border border-primary-500 rounded-lg p-3 shadow-xl opacity-90 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-white text-sm">{draggedPrompt.title}</h3>
                <span className="text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded">
                  {draggedPrompt.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">
                {draggedPrompt.description}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default WorkflowBuilder