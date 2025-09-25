import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import PromptNode from './PromptNode'
import ConnectionLayer from './ConnectionLayer'

const WorkflowCanvas = ({ 
  nodes, 
  connections, 
  tempConnection, 
  executionOrder,
  zoomLevel, 
  onDeleteNode, 
  onUpdateNode,
  onConnectionStart,
  onConnectionEnd,
  onDeleteConnection,
  onCanvasClick,
  onRunNode
}) => {
  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  })

  return (
    <div className="flex-1 overflow-hidden bg-dark-900 relative">
      <div
        ref={setNodeRef}
        className="w-full h-full relative"
        onClick={onCanvasClick}
        style={{
          backgroundImage: `
            radial-gradient(circle, #374151 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
        }}
      >
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
            executionOrder={executionOrder.indexOf(node.id) + 1}
            hasConnections={connections.some(conn => conn.source === node.id || conn.target === node.id)}
            onDelete={onDeleteNode}
            onUpdate={onUpdateNode}
            onConnectionStart={onConnectionStart}
            onConnectionEnd={onConnectionEnd}
            onRun={onRunNode}
            zoomLevel={zoomLevel}
          />
        ))}

        {/* Connection Layer */}
        <ConnectionLayer
          connections={connections}
          tempConnection={tempConnection}
          nodes={nodes}
          onDeleteConnection={onDeleteConnection}
        />
      </div>
    </div>
  )
}

export default WorkflowCanvas