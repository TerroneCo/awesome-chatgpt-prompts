import React, { useState } from 'react'
import { X, ChevronDown, ChevronRight, GripVertical, Play } from 'lucide-react'

const PromptNode = ({ 
  node, 
  executionOrder, 
  hasConnections, 
  onDelete, 
  onUpdate, 
  onConnectionStart, 
  onConnectionEnd, 
  onRun, 
  zoomLevel 
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    if (e.target.closest('.node-content') || e.target.closest('.node-controls')) {
      return
    }
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - node.position.x * zoomLevel,
      y: e.clientY - node.position.y * zoomLevel
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const newX = (e.clientX - dragStart.x) / zoomLevel
    const newY = (e.clientY - dragStart.y) / zoomLevel
    
    onUpdate(node.id, {
      position: { x: newX, y: newY }
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, zoomLevel])

  const toggleCollapse = () => {
    onUpdate(node.id, { isCollapsed: !node.isCollapsed })
  }

  const handleRunNode = (e) => {
    e.stopPropagation()
    onRun(node.id)
  }
  return (
    <div
      className={`absolute bg-dark-800 border border-dark-600 rounded-lg shadow-xl transition-all duration-200 ${
        isDragging ? 'cursor-grabbing shadow-2xl border-primary-500' : 'cursor-grab hover:border-primary-500/50'
      } ${hasConnections ? 'border-primary-500/30' : ''}`}
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        minHeight: node.isCollapsed ? 'auto' : node.size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Connection Points */}
      <div 
        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full border-2 border-dark-800 cursor-pointer hover:bg-primary-400 hover:scale-110 transition-all z-10"
        onMouseDown={(e) => onConnectionStart(node.id, 'input', e)}
        onMouseUp={(e) => onConnectionEnd(node.id, 'input', e)}
        title="Input connection point"
      ></div>
      <div 
        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-secondary-500 rounded-full border-2 border-dark-800 cursor-pointer hover:bg-secondary-400 hover:scale-110 transition-all z-10"
        onMouseDown={(e) => onConnectionStart(node.id, 'output', e)}
        onMouseUp={(e) => onConnectionEnd(node.id, 'output', e)}
        title="Output connection point"
      ></div>

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-dark-700">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Execution Order Badge */}
          {executionOrder > 0 && (
            <div className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {executionOrder}
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="text-slate-400 hover:text-white transition-colors node-controls"
          >
            {node.isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate">{node.title}</h3>
            <span className="text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded">
              {node.category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={handleRunNode}
            className="text-slate-400 hover:text-green-400 transition-colors p-1 node-controls"
            title="Test this node"
          >
            <Play className="h-3 w-3" />
          </button>
          <GripVertical className="h-4 w-4 text-slate-500" />
          <button
            onClick={() => onDelete(node.id)}
            className="text-slate-400 hover:text-red-400 transition-colors p-1 node-controls"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Node Content */}
      {!node.isCollapsed && (
        <div className="p-3 node-content">
          <div className="bg-dark-700 rounded p-3 max-h-32 overflow-y-auto">
            <p className="text-xs text-slate-300 leading-relaxed">
              {node.content}
            </p>
          </div>
        </div>
      )}

      {/* Resize Handle */}
      {!node.isCollapsed && (
        <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-slate-500"></div>
        </div>
      )}
    </div>
  )
}

export default PromptNode