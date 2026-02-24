import React, { useState, useRef, useEffect, useCallback } from 'react'
import { themeClasses, combineClasses } from '../../utils/themeClasses'

const YouTubeDialog = ({ editor, onClose }) => {
  const [url, setUrl] = useState('')
  const inputRef = useRef()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!url.trim()) return
    editor.commands.setYoutubeVideo({ src: url, width: 640, height: 480 })
    onClose()
  }, [url, editor, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className={combineClasses(
          'w-96 p-4',
          themeClasses.bg.card,
          'border',
          themeClasses.border.primary,
          themeClasses.effects.rounded,
          themeClasses.effects.shadowLayeredLg
        )}
      >
        <label className={combineClasses('block mb-2 text-sm font-medium', themeClasses.text.primary)}>
          YouTube URL
        </label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={combineClasses(
            'w-full px-3 py-2 mb-3 text-sm border rounded-md outline-none',
            themeClasses.bg.primary,
            themeClasses.border.primary,
            themeClasses.text.primary,
            'focus:border-medium-accent-green focus:ring-1 focus:ring-medium-accent-green'
          )}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose()
          }}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={combineClasses('px-3 py-1.5 text-sm rounded-md', themeClasses.text.secondary, 'hover:bg-medium-hover')}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!url.trim()}
            className="px-3 py-1.5 text-sm text-white bg-medium-accent-green rounded-md hover:bg-medium-accent-green/90 disabled:opacity-50"
          >
            Chèn video
          </button>
        </div>
      </form>
    </div>
  )
}

export default YouTubeDialog
