import React, { useState, useRef, useEffect } from 'react'
import { FloatingMenu } from '@tiptap/react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FaPlus,
  FaImage,
  FaCode,
  FaYoutube,
  FaMinus,
} from 'react-icons/fa'

const FloatingIcon = ({ icon: Icon, onClick, title }) => (
  <button
    onClick={onClick}
    className="w-9 h-9 flex items-center justify-center rounded-full border border-[#e0e0e0] text-[#757575] hover:text-[#292929] hover:border-[#292929] transition-colors bg-white"
    title={title}
  >
    <Icon className="w-[14px] h-[14px]" />
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
      <div ref={containerRef} className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-200 ${
            isOpen
              ? 'border-[#292929] text-[#292929] rotate-45'
              : 'border-[#e0e0e0] text-[#c2c2c2] hover:border-[#292929] hover:text-[#292929]'
          }`}
        >
          <FaPlus className="w-[14px] h-[14px]" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="flex items-center gap-2 overflow-hidden"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FloatingMenu>
  )
}

export default FloatingToolbar
