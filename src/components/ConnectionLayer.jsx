import React from 'react'
import { X } from 'lucide-react'

const ConnectionLayer = ({ connections, tempConnection, nodes, onDeleteConnection }) => {
  const getNodeCenter = (nodeId, type) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return { x: 0, y: 0 }
    
    const x = type === 'output' 
      ? node.position.x + node.size.width 
      : node.position.x
    const y = node.position.y + node.size.height / 2
    
    return { x, y }
  }

  const createPath = (start, end) => {
    const dx = end.x - start.x
    const dy = end.y - start.y
    const controlPointOffset = Math.abs(dx) * 0.5
    
    return `M ${start.x} ${start.y} C ${start.x + controlPointOffset} ${start.y}, ${end.x - controlPointOffset} ${end.y}, ${end.x} ${end.y}`
  }

  const getPathMidpoint = (start, end) => {
    return {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    }
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#8B5CF6"
          />
        </marker>
      </defs>
      
      {/* Render existing connections */}
      {connections.map((connection) => {
        const start = getNodeCenter(connection.source, 'output')
        const end = getNodeCenter(connection.target, 'input')
        const path = createPath(start, end)
        const midpoint = getPathMidpoint(start, end)
        
        return (
          <g key={connection.id}>
            {/* Connection line */}
            <path
              d={path}
              stroke="#8B5CF6"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="hover:stroke-purple-400 transition-colors cursor-pointer pointer-events-auto"
              onClick={() => onDeleteConnection(connection.id)}
            />
            
            {/* Delete button */}
            <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-auto">
              <circle
                cx={midpoint.x}
                cy={midpoint.y}
                r="8"
                fill="#DC2626"
                className="cursor-pointer"
                onClick={() => onDeleteConnection(connection.id)}
              />
              <foreignObject
                x={midpoint.x - 6}
                y={midpoint.y - 6}
                width="12"
                height="12"
                className="pointer-events-none"
              >
                <X className="h-3 w-3 text-white" />
              </foreignObject>
            </g>
          </g>
        )
      })}
      
      {/* Render temporary connection while dragging */}
      {tempConnection && (
        <path
          d={createPath(tempConnection.start, tempConnection.end)}
          stroke="#6B7280"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          markerEnd="url(#arrowhead)"
        />
      )}
    </svg>
  )
}

export default ConnectionLayer