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
import { themeClasses, combineClasses } from '../../utils/themeClasses'

const COMMANDS = [
  { title: 'Tiêu đề 1', icon: FaHeading, command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { title: 'Tiêu đề 2', icon: FaHeading, command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { title: 'Tiêu đề 3', icon: FaHeading, command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { title: 'Danh sách', icon: FaListUl, command: ({ editor }) => editor.chain().focus().toggleBulletList().run() },
  { title: 'Danh sách số', icon: FaListOl, command: ({ editor }) => editor.chain().focus().toggleOrderedList().run() },
  { title: 'Việc cần làm', icon: FaTasks, command: ({ editor }) => editor.chain().focus().toggleTaskList().run() },
  { title: 'Trích dẫn', icon: FaQuoteRight, command: ({ editor }) => editor.chain().focus().toggleBlockquote().run() },
  { title: 'Khối mã', icon: FaCode, command: ({ editor }) => editor.chain().focus().toggleCodeBlock().run() },
  { title: 'Bảng', icon: FaTable, command: ({ editor }) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Đường kẻ ngang', icon: FaMinus, command: ({ editor }) => editor.chain().focus().setHorizontalRule().run() },
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
      className={combineClasses(
        'py-1.5 px-1 min-w-[200px] max-h-[300px] overflow-y-auto rounded-lg',
        themeClasses.bg.card,
        'border',
        themeClasses.border.primary,
        themeClasses.effects.shadowLayeredLg
      )}
    >
      {filteredItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className={combineClasses(
              'flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md',
              themeClasses.animations.smooth,
              index === selectedIndex
                ? 'bg-medium-accent-green/10 text-medium-accent-green'
                : combineClasses(themeClasses.text.primary, 'hover:bg-medium-hover')
            )}
          >
            {Icon && <Icon className="w-4 h-4 opacity-60" />}
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
