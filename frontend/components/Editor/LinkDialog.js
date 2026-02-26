import React, { useState, useRef, useEffect, useCallback } from 'react'

const LinkDialog = ({ editor, onClose }) => {
  const existingHref = editor?.getAttributes('link')?.href || ''
  const [url, setUrl] = useState(existingHref)
  const inputRef = useRef()

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      const href = url.match(/^https?:\/\//) ? url : `https://${url}`
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    }
    onClose()
  }, [url, editor, onClose])

  const handleRemove = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    onClose()
  }, [editor, onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-96 p-5 bg-white border border-[#e6e6e6] rounded-lg shadow-lg"
      >
        <label className="block mb-2 text-sm font-medium text-[#292929]">
          Link URL
        </label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 mb-4 text-sm border border-[#e6e6e6] rounded-md outline-none text-[#292929] focus:border-[#292929] transition-colors"
          onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        />
        <div className="flex justify-end gap-2">
          {existingHref && (
            <button type="button" onClick={handleRemove} className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors">
              Remove
            </button>
          )}
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-[#757575] hover:text-[#292929] rounded-md transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-3 py-1.5 text-sm text-white bg-[#1a8917] rounded-md hover:bg-[#156d12] transition-colors">
            {existingHref ? 'Update' : 'Add link'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LinkDialog
