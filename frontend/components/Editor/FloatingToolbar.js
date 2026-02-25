import React, { useState, useRef, useEffect } from 'react'
import { FloatingMenu } from '@tiptap/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FaPlus,
  FaTimes,
  FaImage,
  FaCode,
  FaTable,
  FaYoutube,
  FaMinus,
  FaQuoteRight,
  FaTasks,
} from 'react-icons/fa'

const FloatingIcon = ({ icon: Icon, onClick, title }) => (
  <button
    onClick={onClick}
    className="w-8 h-8 flex items-center justify-center rounded-full text-medium-text-secondary hover:text-medium-accent-green transition-colors"
    title={title}
  >
    <Icon className="w-4 h-4" />
  </button>
)

const FloatingToolbar = ({ editor, onImageUpload, onYoutubeClick }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close when editor content changes (user typed or inserted something)
  useEffect(() => {
    if (!editor) return
    const handler = () => setIsOpen(false)
    editor.on('update', handler)
    return () => editor.off('update', handler)
  }, [editor])

  if (!editor) return null

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: 'left-start',
        offset: [-4, 8],
      }}
      shouldShow={({ state }) => {
        const { $from } = state.selection
        const currentLineText = $from.nodeBefore?.textContent || ''
        const isEmptyLine = $from.parent.isTextblock && $from.parent.textContent === ''
        return isEmptyLine && !currentLineText
      }}
    >
      <div ref={containerRef} className="flex items-center gap-1">
        {/* + toggle button */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-8 h-8 flex items-center justify-center rounded-full border border-medium-border text-medium-text-muted hover:text-medium-accent-green hover:border-medium-accent-green transition-all ${
            isOpen ? 'rotate-45 border-medium-accent-green text-medium-accent-green' : ''
          }`}
          style={{ transition: 'transform 0.15s ease, color 0.15s ease, border-color 0.15s ease' }}
        >
          <FaPlus className="w-3.5 h-3.5" />
        </button>

        {/* Expandable icon row */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex items-center gap-0.5 overflow-hidden"
            >
              <FloatingIcon
                icon={FaImage}
                onClick={() => { onImageUpload(); setIsOpen(false) }}
                title="Hình ảnh"
              />
              <FloatingIcon
                icon={FaCode}
                onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setIsOpen(false) }}
                title="Khối mã"
              />
              <FloatingIcon
                icon={FaTable}
                onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setIsOpen(false) }}
                title="Bảng"
              />
              <FloatingIcon
                icon={FaYoutube}
                onClick={() => { onYoutubeClick(); setIsOpen(false) }}
                title="Video YouTube"
              />
              <FloatingIcon
                icon={FaQuoteRight}
                onClick={() => { editor.chain().focus().toggleBlockquote().run(); setIsOpen(false) }}
                title="Trích dẫn"
              />
              <FloatingIcon
                icon={FaMinus}
                onClick={() => { editor.chain().focus().setHorizontalRule().run(); setIsOpen(false) }}
                title="Đường kẻ ngang"
              />
              <FloatingIcon
                icon={FaTasks}
                onClick={() => { editor.chain().focus().toggleTaskList().run(); setIsOpen(false) }}
                title="Danh sách việc cần làm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FloatingMenu>
  )
}

export default FloatingToolbar
