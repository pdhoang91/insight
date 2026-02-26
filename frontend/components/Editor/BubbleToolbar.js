import React from 'react'
import { BubbleMenu } from '@tiptap/react'
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaLink,
  FaQuoteRight,
  FaCode,
} from 'react-icons/fa'

const BubbleButton = ({ icon: Icon, label, onClick, isActive, title }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-2 text-sm transition-colors ${
      isActive ? 'text-[#1a8917]' : 'text-white/70 hover:text-white'
    }`}
    title={title}
  >
    {Icon ? <Icon className="w-[15px] h-[15px]" /> : <span className="text-xs font-bold">{label}</span>}
  </button>
)

const Separator = () => <div className="w-px h-4 bg-white/20 mx-0.5" />

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
      <div className="flex items-center px-1 py-0.5 rounded-lg bg-[#292929] shadow-lg">
        <BubbleButton
          icon={FaBold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        />
        <BubbleButton
          icon={FaItalic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        />
        <BubbleButton
          icon={FaStrikethrough}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        />
        <BubbleButton
          icon={FaLink}
          onClick={onLinkClick}
          isActive={editor.isActive('link')}
          title="Link"
        />

        <Separator />

        <BubbleButton
          label="H1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        />
        <BubbleButton
          label="H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        />

        <Separator />

        <BubbleButton
          icon={FaQuoteRight}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        />
        <BubbleButton
          icon={FaCode}
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Inline code"
        />
      </div>
    </BubbleMenu>
  )
}

export default BubbleToolbar
