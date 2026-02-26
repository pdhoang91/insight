import React, { useState, useRef, useEffect, useCallback } from 'react'

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
        className="w-96 p-5 bg-white border border-[#e6e6e6] rounded-lg shadow-lg"
      >
        <label className="block mb-2 text-sm font-medium text-[#292929]">
          YouTube URL
        </label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 mb-4 text-sm border border-[#e6e6e6] rounded-md outline-none text-[#292929] focus:border-[#292929] transition-colors"
          onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-[#757575] hover:text-[#292929] rounded-md transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!url.trim()}
            className="px-3 py-1.5 text-sm text-white bg-[#1a8917] rounded-md hover:bg-[#156d12] transition-colors disabled:opacity-50"
          >
            Insert video
          </button>
        </div>
      </form>
    </div>
  )
}

export default YouTubeDialog
