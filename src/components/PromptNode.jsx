import React, { useState } from 'react'
import { X, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { DataSourceIcon } from './DataSourceCard'

// Variable detection utility functions
const detectVariables = (text) => {
  if (!text) return []
  
  // Regex to match {{variable}}, {variable}, or [variable] patterns
  const variableRegex = /(\{\{([^}]+)\}\}|\{([^}]+)\}|\[([^\]]+)\])/g
  const variables = new Set()
  let match
  
  while ((match = variableRegex.exec(text)) !== null) {
    // Extract the variable name from whichever capture group matched
    const variableName = match[2] || match[3] || match[4]
    if (variableName && variableName.trim()) {
      variables.add(variableName.trim())
    }
  }
  
  return Array.from(variables)
}

const highlightVariables = (text) => {
  if (!text) return text
  
  // Replace variables with highlighted spans
  return text.replace(/(\{\{([^}]+)\}\}|\{([^}]+)\}|\[([^\]]+)\])/g, (match) => {
    return `<span class="variable-highlight">${match}</span>`
  })
}

const getVariableStatus = (variables, mappedVariables = []) => {
  if (variables.length === 0) return 'none'
  if (mappedVariables.length === 0) return 'unmapped'
  if (mappedVariables.length === variables.length) return 'mapped'
  return 'partial'
}

const ConnectionPoint = ({ nodeId, type, position, onConnectionStart, onConnectionEnd }) => {
  const handleMouseDown = (e) => {
    e.stopPropagation()
    onConnectionStart(nodeId, type, position)
  }
  
  const handleMouseUp = (e) => {
    e.stopPropagation()
    onConnectionEnd(nodeId, type, position)
  }
  
  return (
    <div
      className={`absolute w-2 h-2 rounded-full border-2 cursor-pointer transition-all duration-200 hover:scale-150 z-10 ${
        type === 'input' 
          ? 'bg-blue-500 border-blue-400 -left-1 hover:bg-blue-400' 
          : 'bg-purple-500 border-purple-400 -right-1 hover:bg-purple-400'
      }`}
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      title={type === 'input' ? 'Input connection point' : 'Output connection point'}
    />
  )
}

const PromptNode = ({ node, onDelete, onUpdate, onConnectionStart, onConnectionEnd, zoomLevel }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showVariables, setShowVariables] = useState(false)
  
  // Detect variables in prompt content
  const detectedVariables = React.useMemo(() => {
    return detectVariables(node.content)
  }, [node.content])
  
  // Get variable status (for future mapping functionality)
  const variableStatus = getVariableStatus(detectedVariables, node.mappedVariables || [])

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

  // Calculate connection point positions
  const inputPosition = {
    x: node.position.x,
    y: node.position.y + (node.isCollapsed ? 30 : node.size.height / 2)
  }
  
  const outputPosition = {
    x: node.position.x + node.size.width,
    y: node.position.y + (node.isCollapsed ? 30 : node.size.height / 2)
  }
  return (
    <div
      className={`absolute bg-dark-800 border border-dark-600 rounded-lg shadow-xl transition-all duration-200 ${
        isDragging ? 'cursor-grabbing shadow-2xl border-primary-500' : 'cursor-grab hover:border-primary-500/50'
      }`}
      style={node.type === 'data-source' ? {
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        minHeight: node.isCollapsed ? 'auto' : node.size.height,
        zIndex: 2,
        background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`,
        borderColor: node.brandColor,
        borderWidth: '2px',
        borderRadius: '8px',
        boxShadow: `0 0 20px ${node.brandColor}20`
      } : {
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        minHeight: node.isCollapsed ? 'auto' : node.size.height,
        zIndex: 2,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Connection Points */}
      <ConnectionPoint
        nodeId={node.id}
        type="input"
        position={inputPosition}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
      />
      <ConnectionPoint
        nodeId={node.id}
        type="output"
        position={outputPosition}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
      />

      {/* Node Header */}
      <div className="flex items-center justify-between p-3 border-b border-dark-700">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
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
          
          {/* Data source icon */}
          {node.type === 'data-source' && node.icon && (
            <div 
              className="p-1 rounded"
              style={{ backgroundColor: `${node.brandColor}20` }}
            >
              <DataSourceIcon 
                icon={node.icon} 
                color={node.brandColor} 
                size={16} 
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white text-sm truncate">{node.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span 
                className="text-xs px-2 py-1 rounded font-medium"
                style={node.type === 'data-source' ? {
                  backgroundColor: `${node.brandColor}30`,
                  color: node.brandColor
                } : {
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#93c5fd'
                }}
              >
              {node.category}
              </span>
              {node.isRealtime && (
                <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full animate-pulse">
                  Real-time
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Field count badge for data sources */}
          {node.type === 'data-source' && node.fields && (
            <span 
              className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white mr-2"
              style={{ backgroundColor: node.brandColor }}
            >
              {node.fields.length}
            </span>
          )}
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
          {node.type === 'data-source' ? (
            <div className="space-y-3">
              {/* Webhook URL for webhook nodes */}
              {node.webhookUrl && (
                <div className="p-2 bg-dark-700 rounded border border-dark-600">
                  <p className="text-xs text-slate-500 mb-1">Webhook URL:</p>
                  <code className="text-xs text-green-400 font-mono break-all">
                    {node.webhookUrl}
                  </code>
                </div>
              )}
              
              {/* Sample fields */}
              {node.fields && (
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-2">Available Fields:</p>
                  <div className="grid grid-cols-2 gap-1">
                    {node.fields.map((field, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-dark-700 text-slate-300 px-2 py-1 rounded truncate"
                        title={field}
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div className="bg-dark-700 rounded p-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {node.content}
                </p>
                {/* Variable count and status indicator for prompt nodes */}
                {node.type !== 'data-source' && detectedVariables.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span 
                      className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center space-x-1 ${
                        variableStatus === 'mapped' ? 'bg-green-500/20 text-green-300' :
                        variableStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        variableStatus === 'mapped' ? 'bg-green-400' :
                        variableStatus === 'partial' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></span>
                      <span>{detectedVariables.length} var{detectedVariables.length !== 1 ? 's' : ''}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Variables section for prompt nodes */}
              {detectedVariables.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setShowVariables(!showVariables)}
                      className="flex items-center space-x-1 text-xs font-medium text-slate-400 hover:text-white transition-colors node-controls"
                    >
                      {showVariables ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      <span>Variables ({detectedVariables.length})</span>
                    </button>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      variableStatus === 'mapped' ? 'bg-green-500/20 text-green-300' :
                      variableStatus === 'partial' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {variableStatus === 'mapped' ? 'Mapped' :
                       variableStatus === 'partial' ? 'Partial' :
                       'Unmapped'}
                    </span>
                  </div>
                  
                  {showVariables && (
                    <div className="bg-dark-700 rounded p-2 space-y-1">
                      {detectedVariables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-mono bg-dark-600 px-2 py-1 rounded">
                            {variable}
                          </span>
                          <span className="text-xs text-slate-500">
                            {node.mappedVariables?.includes(variable) ? '✓ Mapped' : 'Unmapped'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Prompt content with variable highlighting */}
            <div className="bg-dark-700 rounded p-3 max-h-32 overflow-y-auto">
                <div 
                  className="text-xs text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightVariables(node.content) 
                  }}
                />
            </div>
            </div>
          )}
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