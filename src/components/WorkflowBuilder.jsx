import React, { useState, useEffect } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { Search, Plus, Minus, Save, Play, X, ChevronDown, ChevronRight } from 'lucide-react'
import PromptLibrary from './PromptLibrary'
import WorkflowCanvas from './WorkflowCanvas'
import PromptNode from './PromptNode'

const WorkflowBuilder = () => {
  const [prompts, setPrompts] = useState([])
  const [filteredPrompts, setFilteredPrompts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [canvasNodes, setCanvasNodes] = useState([])
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

  // Parse prompts from README data (simulated for now)
  useEffect(() => {
    const samplePrompts = [
      {
        id: 1,
        title: "Linux Terminal",
        category: "Development",
        description: "Act as a linux terminal and execute commands",
        content: "I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show."
      },
      {
        id: 2,
        title: "JavaScript Console",
        category: "Development", 
        description: "Act as a JavaScript console for code execution",
        content: "I want you to act as a javascript console. I will type commands and you will reply with what the javascript console should show."
      },
      {
        id: 3,
        title: "English Translator",
        category: "Language",
        description: "Translate and improve English text",
        content: "I want you to act as an English translator, spelling corrector and improver."
      },
      {
        id: 4,
        title: "Excel Sheet",
        category: "Productivity",
        description: "Act as a text-based Excel sheet",
        content: "I want you to act as a text based excel. You'll only reply me the text-based 10 rows excel sheet with row numbers and cell letters as columns."
      },
      {
        id: 5,
        title: "Travel Guide",
        category: "Lifestyle",
        description: "Provide travel recommendations and guidance",
        content: "I want you to act as a travel guide. I will write you my location and you will suggest a place to visit near my location."
      },
      {
        id: 6,
        title: "Personal Trainer",
        category: "Health",
        description: "Create fitness and nutrition plans",
        content: "I want you to act as a personal trainer. I will provide you with all the information needed about an individual looking to become fitter."
      }
    ]
    
    setPrompts(samplePrompts)
    setFilteredPrompts(samplePrompts)
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
            onDeleteNode={handleDeleteNode}
            onUpdateNode={handleUpdateNode}
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