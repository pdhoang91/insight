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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(26, 20, 16, 0.3)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: '24rem',
          padding: '1.5rem',
          background: 'var(--bg)',
          border: '1px solid var(--border-mid)',
          borderRadius: '4px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text)',
            letterSpacing: '-0.01em',
          }}
        >
          Link URL
        </label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            marginBottom: '1rem',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            outline: 'none',
            color: 'var(--text)',
            background: 'var(--bg)',
            transition: 'border-color 0.2s',
          }}
          className="focus:border-[var(--border-mid)]"
          onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          {existingHref && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                padding: '0.375rem 0.75rem',
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#DC2626',
                background: 'none',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              className="hover:bg-red-50"
            >
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.375rem 0.75rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            className="hover:text-[var(--text)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '0.375rem 0.75rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-inverse)',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            className="hover:opacity-85"
          >
            {existingHref ? 'Update' : 'Add link'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default LinkDialog
