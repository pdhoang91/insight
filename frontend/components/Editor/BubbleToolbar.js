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
    style={{
      padding: '0.375rem 0.5rem',
      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
      transition: 'color 0.2s',
    }}
    className={!isActive ? 'hover:text-[var(--text)]' : ''}
    title={title}
  >
    {children}
  </button>
)

const Separator = () => <div style={{ width: '1px', height: '1.25rem', background: 'var(--border)', margin: '0 0.25rem' }} />

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.375rem 0.5rem',
          borderRadius: '4px',
          background: 'var(--bg)',
          border: '1px solid var(--border-mid)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
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
