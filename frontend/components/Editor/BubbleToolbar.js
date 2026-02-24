import React from 'react'
import { BubbleMenu } from '@tiptap/react'
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaLink,
  FaEraser,
} from 'react-icons/fa'

const QUICK_HIGHLIGHTS = [
  { color: '#fef08a', label: 'Vàng' },
  { color: '#bbf7d0', label: 'Xanh' },
  { color: '#bfdbfe', label: 'Dương' },
  { color: '#fce7f3', label: 'Hồng' },
]

const BubbleButton = ({ icon: Icon, onClick, isActive, title }) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded transition-colors ${
      isActive
        ? 'bg-white/20 text-white'
        : 'text-white/70 hover:text-white hover:bg-white/10'
    }`}
    title={title}
  >
    <Icon className="w-3.5 h-3.5" />
  </button>
)

const BubbleToolbar = ({ editor, onLinkClick }) => {
  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: 'top',
      }}
      shouldShow={({ editor, state }) => {
        const { from, to } = state.selection
        if (from === to) return false
        if (editor.isActive('image')) return false
        if (editor.isActive('codeBlock')) return false
        return true
      }}
    >
      <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg shadow-lg bg-gray-900 border border-gray-700">
        <BubbleButton
          icon={FaBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Đậm"
        />
        <BubbleButton
          icon={FaItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Nghiêng"
        />
        <BubbleButton
          icon={FaUnderline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Gạch chân"
        />
        <BubbleButton
          icon={FaStrikethrough}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Gạch ngang"
        />

        <div className="w-px h-4 bg-gray-600 mx-1" />

        <BubbleButton
          icon={FaLink}
          onClick={onLinkClick}
          isActive={editor.isActive('link')}
          title="Liên kết"
        />

        <div className="w-px h-4 bg-gray-600 mx-1" />

        {QUICK_HIGHLIGHTS.map((h) => (
          <button
            key={h.color}
            onClick={() => editor.chain().focus().toggleHighlight({ color: h.color }).run()}
            className={`w-5 h-5 rounded-sm border transition-opacity hover:opacity-80 ${
              editor.isActive('highlight', { color: h.color })
                ? 'border-white ring-1 ring-white'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: h.color }}
            title={h.label}
          />
        ))}

        <div className="w-px h-4 bg-gray-600 mx-1" />

        <BubbleButton
          icon={FaEraser}
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          isActive={false}
          title="Xóa định dạng"
        />
      </div>
    </BubbleMenu>
  )
}

export default BubbleToolbar
