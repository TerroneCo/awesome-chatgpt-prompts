import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import PromptNode from './PromptNode'

const ConnectionLine = ({ connection, onDelete }) => {
  const { fromPosition, toPosition } = connection
  
  // Calculate control points for bezier curve
  const dx = toPosition.x - fromPosition.x
  const controlPoint1X = fromPosition.x + dx * 0.5
  const controlPoint2X = toPosition.x - dx * 0.5
  
  const pathData = `M ${fromPosition.x} ${fromPosition.y} C ${controlPoint1X} ${fromPosition.y} ${controlPoint2X} ${toPosition.y} ${toPosition.x} ${toPosition.y}`
  
  return (
    <g>
      <path
        d={pathData}
        stroke="#3B82F6"
        strokeWidth="2"
        fill="none"
        className="cursor-pointer hover:stroke-primary-400 transition-colors"
        onClick={() => onDelete(connection.id)}
      />
      {/* Arrow marker */}
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
            fill="#3B82F6"
          />
        </marker>
      </defs>
      <path
        d={pathData}
        stroke="#3B82F6"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        pointerEvents="none"
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
  zoomLevel, 
  onDeleteNode, 
  onUpdateNode, 
  onConnectionStart, 
  onConnectionEnd, 
  onConnectionDelete 
}) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  })

  return (
    <div className="flex-1 overflow-hidden bg-dark-900 relative">
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
          {connections.map((connection) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              onDelete={onConnectionDelete}
            />
          ))}
          <TempConnectionLine tempConnection={tempConnection} />
        </svg>

        {/* Drop Zone Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {nodes.length === 0 && (
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
        {nodes.map((node) => (
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