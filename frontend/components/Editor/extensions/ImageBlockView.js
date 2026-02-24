import React, { useState, useCallback, useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import {
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaExpand,
  FaTrash,
} from 'react-icons/fa'

const ALIGNMENT_OPTIONS = [
  { value: 'left', icon: FaAlignLeft, label: 'Trái' },
  { value: 'center', icon: FaAlignCenter, label: 'Giữa' },
  { value: 'right', icon: FaAlignRight, label: 'Phải' },
  { value: 'full', icon: FaExpand, label: 'Toàn chiều rộng' },
]

const ImageBlockView = ({ node, updateAttributes, deleteNode, selected }) => {
  const { src, alt, caption, alignment, width } = node.attrs
  const [isResizing, setIsResizing] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const imgRef = useRef()
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleResizeStart = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
    startX.current = e.clientX
    startWidth.current = imgRef.current?.offsetWidth || 0

    const handleResizeMove = (moveEvent) => {
      const diff = moveEvent.clientX - startX.current
      const parentWidth = imgRef.current?.parentElement?.offsetWidth || 1
      const newWidthPx = Math.max(100, startWidth.current + diff)
      const newWidthPercent = Math.min(100, Math.round((newWidthPx / parentWidth) * 100))
      updateAttributes({ width: `${newWidthPercent}%` })
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }, [updateAttributes])

  const alignmentClass = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
    full: 'w-full',
  }[alignment] || 'mx-auto'

  return (
    <NodeViewWrapper className="image-block-wrapper my-4">
      <figure
        className={`relative group ${alignmentClass} ${selected ? 'ring-2 ring-medium-accent-green rounded-lg' : ''}`}
        style={{ width: alignment === 'full' ? '100%' : width }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isResizing && setShowControls(false)}
        data-drag-handle
      >
        {/* Alignment controls */}
        {showControls && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-gray-900 rounded-lg shadow-lg z-10">
            {ALIGNMENT_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => updateAttributes({ alignment: value })}
                className={`p-1.5 rounded transition-colors ${
                  alignment === value
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={label}
              >
                <Icon className="w-3 h-3" />
              </button>
            ))}
            <div className="w-px h-4 bg-gray-600 mx-0.5" />
            <button
              onClick={deleteNode}
              className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
              title="Xóa"
            >
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Image */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="w-full rounded-lg"
          draggable={false}
        />

        {/* Resize handle */}
        {showControls && alignment !== 'full' && (
          <div
            className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={handleResizeStart}
          >
            <div className="w-1 h-8 bg-medium-accent-green rounded-full" />
          </div>
        )}

        {/* Caption */}
        <figcaption
          contentEditable
          suppressContentEditableWarning
          className="text-center text-sm text-medium-text-secondary mt-2 outline-none empty:before:content-['Thêm_chú_thích...'] empty:before:text-medium-text-secondary/40 empty:before:italic"
          onBlur={(e) => updateAttributes({ caption: e.target.textContent })}
        >
          {caption}
        </figcaption>
      </figure>
    </NodeViewWrapper>
  )
}

export default ImageBlockView
