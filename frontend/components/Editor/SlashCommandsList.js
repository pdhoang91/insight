import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import {
  FaHeading,
  FaImage,
  FaCode,
  FaTable,
  FaYoutube,
  FaMinus,
  FaQuoteRight,
  FaTasks,
  FaListUl,
  FaListOl,
} from 'react-icons/fa'

const COMMANDS = [
  { title: 'Heading 1', icon: FaHeading, command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: 'Heading 2', icon: FaHeading, command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: 'Heading 3', icon: FaHeading, command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { title: 'Bullet list', icon: FaListUl, command: ({ editor }) => editor.chain().focus().toggleBulletList().run() },
  { title: 'Numbered list', icon: FaListOl, command: ({ editor }) => editor.chain().focus().toggleOrderedList().run() },
  { title: 'Task list', icon: FaTasks, command: ({ editor }) => editor.chain().focus().toggleTaskList().run() },
  { title: 'Quote', icon: FaQuoteRight, command: ({ editor }) => editor.chain().focus().toggleBlockquote().run() },
  { title: 'Code block', icon: FaCode, command: ({ editor }) => editor.chain().focus().toggleCodeBlock().run() },
  { title: 'Table', icon: FaTable, command: ({ editor }) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Divider', icon: FaMinus, command: ({ editor }) => editor.chain().focus().setHorizontalRule().run() },
]

const SlashCommandsList = forwardRef(({ items, command, editor }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef()

  const filteredItems = items || COMMANDS

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const selectItem = useCallback((index) => {
    const item = filteredItems[index]
    if (item) {
      command(item)
    }
  }, [filteredItems, command])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }), [filteredItems, selectedIndex, selectItem])

  useEffect(() => {
    const el = containerRef.current?.children[selectedIndex]
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!filteredItems.length) return null

  return (
    <div
      ref={containerRef}
      className="py-1.5 px-1 min-w-[200px] max-h-[300px] overflow-y-auto rounded-lg bg-white border border-gray-200 shadow-lg"
    >
      {filteredItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className={`flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors ${
              index === selectedIndex
                ? 'bg-[#f2f2f2] text-[#292929]'
                : 'text-[#292929] hover:bg-[#fafafa]'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 text-[#757575]" />}
            <span>{item.title}</span>
          </button>
        )
      })}
    </div>
  )
})

SlashCommandsList.displayName = 'SlashCommandsList'

export { COMMANDS }
export default SlashCommandsList
