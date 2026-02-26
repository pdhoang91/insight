import React from 'react'
import { BubbleMenu } from '@tiptap/react'
import {
  FaBold,
  FaItalic,
  FaLink,
  FaQuoteRight,
} from 'react-icons/fa'

const BubbleButton = ({ children, onClick, isActive, title }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1.5 transition-colors ${
      isActive ? 'text-[#1a8917]' : 'text-[#757575] hover:text-[#292929]'
    }`}
    title={title}
  >
    {children}
  </button>
)

const Separator = () => <div className="w-px h-5 bg-[#e0e0e0] mx-1" />

const BubbleToolbar = ({ editor, onLinkClick }) => {
  if (!editor) return null

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: 'top',
        offset: [0, 8],
      }}
      shouldShow={({ editor, state }) => {
        const { from, to } = state.selection
        if (from === to) return false
        if (editor.isActive('image')) return false
        if (editor.isActive('codeBlock')) return false
        return true
      }}
    >
      <div className="flex items-center px-1.5 py-0.5 rounded-full bg-white border border-[#e0e0e0] shadow-lg">
        <BubbleButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <FaBold className="w-3.5 h-3.5" />
        </BubbleButton>
        <BubbleButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <FaItalic className="w-3.5 h-3.5" />
        </BubbleButton>
        <BubbleButton
          onClick={onLinkClick}
          isActive={editor.isActive('link')}
          title="Link"
        >
          <FaLink className="w-3.5 h-3.5" />
        </BubbleButton>

        <Separator />

        <BubbleButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <span className="text-[15px] font-bold leading-none">T</span>
        </BubbleButton>
        <BubbleButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <span className="text-[11px] font-bold leading-none">T</span>
        </BubbleButton>

        <Separator />

        <BubbleButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <FaQuoteRight className="w-3.5 h-3.5" />
        </BubbleButton>
      </div>
    </BubbleMenu>
  )
}

export default BubbleToolbar
