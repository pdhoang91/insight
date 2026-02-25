import React, { useState, useRef, useEffect } from 'react'
import { FloatingMenu } from '@tiptap/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FaPlus,
  FaImage,
  FaCode,
  FaYoutube,
  FaMinus,
  FaQuoteRight,
} from 'react-icons/fa'

const FloatingIcon = ({ icon: Icon, onClick, title }) => (
  <button
    onClick={onClick}
    className="w-7 h-7 flex items-center justify-center rounded-full text-[#6b6b6b] hover:text-[#242424] transition-colors"
    title={title}
  >
    <Icon className="w-[15px] h-[15px]" />
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
      <div ref={containerRef} className="flex items-center gap-0.5">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-[33px] h-[33px] flex items-center justify-center rounded-full border transition-all duration-150 ${
            isOpen
              ? 'border-[#242424] text-[#242424] rotate-45'
              : 'border-[#b3b3b1] text-[#b3b3b1] hover:border-[#6b6b6b] hover:text-[#6b6b6b]'
          }`}
        >
          <FaPlus className="w-3.5 h-3.5" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex items-center gap-0.5 overflow-hidden ml-1"
            >
              <FloatingIcon
                icon={FaImage}
                onClick={() => { onImageUpload(); setIsOpen(false) }}
                title="Image"
              />
              <FloatingIcon
                icon={FaCode}
                onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setIsOpen(false) }}
                title="Code block"
              />
              <FloatingIcon
                icon={FaYoutube}
                onClick={() => { onYoutubeClick(); setIsOpen(false) }}
                title="YouTube"
              />
              <FloatingIcon
                icon={FaMinus}
                onClick={() => { editor.chain().focus().setHorizontalRule().run(); setIsOpen(false) }}
                title="Divider"
              />
              <FloatingIcon
                icon={FaQuoteRight}
                onClick={() => { editor.chain().focus().toggleBlockquote().run(); setIsOpen(false) }}
                title="Quote"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FloatingMenu>
  )
}

export default FloatingToolbar
