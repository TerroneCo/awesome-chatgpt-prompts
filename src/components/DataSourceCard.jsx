import React from 'react'
import { useDraggable } from '@dnd-kit/core'

const DataSourceIcon = ({ icon, color, size = 20 }) => {
  const iconProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }

  switch (icon) {
    case 'database':
      return (
        <svg {...iconProps}>
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
        </svg>
      )
    case 'users':
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    case 'briefcase':
      return (
        <svg {...iconProps}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      )
    case 'zap':
      return (
        <svg {...iconProps}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      )
    case 'file-text':
      return (
        <svg {...iconProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      )
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
  }
}

const DataSourceCard = ({ dataSource }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: dataSource.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`relative bg-gradient-to-br from-dark-700 to-dark-800 border-2 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={(() => {
        const combinedStyle = {
          ...style,
          borderColor: dataSource.brandColor,
          boxShadow: isDragging ? 'none' : `0 0 10px ${dataSource.brandColor}20`
        };
        return combinedStyle;
      })()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div 
            className="p-1.5 rounded-lg"
            style={{ backgroundColor: `${dataSource.brandColor}20` }}
          >
            <DataSourceIcon 
              icon={dataSource.icon} 
              color={dataSource.brandColor} 
              size={16} 
            />
          </div>
          <h3 className="font-medium text-white text-sm truncate">
            {dataSource.title}
          </h3>
        </div>
        
        {/* Real-time badge */}
        {dataSource.isRealtime && (
          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full animate-pulse">
            Real-time
          </span>
        )}
      </div>

      {/* Category badge */}
      <div className="mb-2">
        <span 
          className="text-xs px-2 py-1 rounded font-medium"
          style={{ 
            backgroundColor: `${dataSource.brandColor}30`,
            color: dataSource.brandColor 
          }}
        >
          {dataSource.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        {dataSource.description}
      </p>

      {/* Webhook URL for webhook nodes */}
      {dataSource.webhookUrl && (
        <div className="mb-2 p-2 bg-dark-600 rounded border border-dark-500">
          <p className="text-xs text-slate-500 mb-1">Webhook URL:</p>
          <code className="text-xs text-green-400 font-mono break-all">
            {dataSource.webhookUrl}
          </code>
        </div>
      )}

      {/* Sample fields */}
      <div className="space-y-1">
        <p className="text-xs text-slate-500 font-medium">Sample Fields:</p>
        <div className="flex flex-wrap gap-1">
          {dataSource.fields.slice(0, 3).map((field, index) => (
            <span 
              key={index}
              className="text-xs bg-dark-600 text-slate-300 px-2 py-0.5 rounded"
            >
              {field}
            </span>
          ))}
          {dataSource.fields.length > 3 && (
            <span className="text-xs text-slate-500">
              +{dataSource.fields.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Field count badge */}
      <div className="absolute -top-1 -right-1">
        <span 
          className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: dataSource.brandColor }}
        >
          {dataSource.fields.length}
        </span>
      </div>
    </div>
  )
}

export { DataSourceIcon }
export default DataSourceCard