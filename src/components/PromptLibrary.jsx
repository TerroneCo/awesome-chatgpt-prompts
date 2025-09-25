import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'

const PromptCard = ({ prompt }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: prompt.id.toString(),
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-dark-700 border border-dark-600 rounded-lg p-3 mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-primary-500/50 hover:shadow-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white text-xs truncate">{prompt.title}</h3>
          <span className="text-[10px] bg-primary-500/20 text-primary-300 px-1.5 py-0.5 rounded mt-1 inline-block">
            {prompt.category}
          </span>
        </div>
        <GripVertical className="h-4 w-4 text-slate-500 flex-shrink-0 ml-2" />
      </div>
      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
        {prompt.description}
      </p>
    </div>
  )
}

const PromptLibrary = ({ prompts }) => {
  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="space-y-2">
        {prompts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No prompts found</p>
          </div>
        ) : (
          prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))
        )}
      </div>
    </div>
  )
}

export default PromptLibrary