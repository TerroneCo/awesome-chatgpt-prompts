import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import PromptNode from './PromptNode'

const ConnectionLine = ({ connection, isSelected, onSelect, onDelete }) => {
  const { fromPosition, toPosition } = connection
  
  // Calculate control points for bezier curve
  const dx = toPosition.x - fromPosition.x
  const controlPoint1X = fromPosition.x + dx * 0.5
  const controlPoint2X = toPosition.x - dx * 0.5
  
  const pathData = `M ${fromPosition.x} ${fromPosition.y} C ${controlPoint1X} ${fromPosition.y} ${controlPoint2X} ${toPosition.y} ${toPosition.x} ${toPosition.y}`
  
  return (
    <g>
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          onSelect(connection.id)
        }}
      />
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isSelected ? "#EF4444" : "#3B82F6"}
          />
        </marker>
      </defs>
      {/* Visible connection line */}
      <path
        d={pathData}
        stroke={isSelected ? "#EF4444" : "#3B82F6"}
        strokeWidth={isSelected ? "3" : "2"}
        fill="none"
        markerEnd={`url(#arrowhead-${connection.id})`}
        className="pointer-events-none"
        style={{
          filter: isSelected ? 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.5))' : 'none'
        }}
      />
    </g>
  )
}

const TempConnectionLine = ({ tempConnection }) => {
  if (!tempConnection) return null
  
  const { from, to } = tempConnection
  const dx = to.x - from.x
  const controlPoint1X = from.x + dx * 0.5
  const controlPoint2X = to.x - dx * 0.5
  
  const pathData = `M ${from.x} ${from.y} C ${controlPoint1X} ${from.y} ${controlPoint2X} ${to.y} ${to.x} ${to.y}`
  
  return (
    <path
      d={pathData}
      stroke="#3B82F6"
      strokeWidth="2"
      strokeDasharray="5,5"
      fill="none"
      opacity="0.6"
      pointerEvents="none"
    />
  )
}

const WorkflowCanvas = ({ 
  nodes, 
  connections, 
  tempConnection, 
  selectedConnection,
  zoomLevel, 
  onDeleteNode, 
  onUpdateNode, 
  onConnectionStart, 
  onConnectionEnd, 
  onConnectionSelect,
  onConnectionDelete 
}) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  })

  // Calculate dynamic connection positions based on current node positions
  const getConnectionsWithPositions = () => {
    if (!connections || !nodes) return []
    
    return connections.map(connection => {
      // Find the source and target nodes
      const fromNode = nodes.find(n => n.id === connection.from)
      const toNode = nodes.find(n => n.id === connection.to)
      
      // Skip connections where nodes don't exist (error handling)
      if (!fromNode || !toNode) {
        console.warn(`Connection ${connection.id} references missing nodes:`, {
          from: connection.from,
          to: connection.to,
          fromNodeExists: !!fromNode,
          toNodeExists: !!toNode
        })
        return null
      }
      
      // Calculate node dimensions (use default if not specified)
      const fromNodeWidth = fromNode.size?.width || 300
      const fromNodeHeight = fromNode.isCollapsed ? 60 : (fromNode.size?.height || 200)
      const toNodeHeight = toNode.isCollapsed ? 60 : (toNode.size?.height || 200)
      
      // Calculate connection endpoints
      const fromPosition = {
        x: fromNode.position.x + fromNodeWidth, // Right edge of source node
        y: fromNode.position.y + fromNodeHeight / 2 // Middle of source node
      }
      
      const toPosition = {
        x: toNode.position.x, // Left edge of target node
        y: toNode.position.y + toNodeHeight / 2 // Middle of target node
      }
      
      return {
        ...connection,
        fromPosition,
        toPosition
      }
    }).filter(Boolean) // Remove null entries from missing nodes
  }

  const connectionsWithPositions = getConnectionsWithPositions()

  return (
    <div 
      className="flex-1 overflow-hidden bg-dark-900 relative"
      onClick={() => onConnectionSelect && onConnectionSelect(null)} // Deselect when clicking on canvas
    >
      <div
        ref={setNodeRef}
        className="w-full h-full relative workflow-canvas"
        style={{
          backgroundImage: `
            radial-gradient(circle, #374151 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
        }}
      >
        {/* SVG Layer for Connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {/* Render all connections with dynamic positions */}
          {connectionsWithPositions.map((connection) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              isSelected={selectedConnection === connection.id}
              onSelect={onConnectionSelect}
              onDelete={onConnectionDelete}
            />
          ))}
          
          {/* Render temporary connection during creation */}
          <TempConnectionLine tempConnection={tempConnection} />
        </svg>

        {/* Drop Zone Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {nodes && nodes.length === 0 && (
            <div className="text-center">
              <div className="bg-dark-800 border-2 border-dashed border-dark-600 rounded-xl p-8 max-w-md">
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  Start Building Your Workflow
                </h3>
                <p className="text-slate-400 text-sm">
                  Drag prompts from the library to create your workflow nodes
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Render Nodes */}
        {nodes && nodes.map((node) => (
          <PromptNode
            key={node.id}
            node={node}
            onDelete={onDeleteNode}
            onUpdate={onUpdateNode}
            onConnectionStart={onConnectionStart}
            onConnectionEnd={onConnectionEnd}
            zoomLevel={zoomLevel}
          />
        ))}
      </div>
    </div>
  )
}

export default WorkflowCanvas