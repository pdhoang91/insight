import React, { useState, useRef, useEffect, useCallback } from 'react'
import { themeClasses, combineClasses } from '../../utils/themeClasses'

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
          URL liên kết
        </label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
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
          {existingHref && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              Xóa liên kết
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={combineClasses('px-3 py-1.5 text-sm rounded-md', themeClasses.text.secondary, 'hover:bg-medium-hover')}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-sm text-white bg-medium-accent-green rounded-md hover:bg-medium-accent-green/90"
          >
            {existingHref ? 'Cập nhật' : 'Thêm liên kết'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LinkDialog
