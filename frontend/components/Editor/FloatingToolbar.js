import React from 'react'
import { FloatingMenu } from '@tiptap/react'
import {
  FaHeading,
  FaImage,
  FaCode,
  FaTable,
  FaYoutube,
  FaMinus,
  FaQuoteRight,
  FaTasks,
} from 'react-icons/fa'

const FloatingButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded-md text-medium-text-secondary hover:text-medium-accent-green transition-colors"
  >
    <Icon className="w-3.5 h-3.5 opacity-60" />
    <span>{label}</span>
  </button>
)

const FloatingToolbar = ({ editor, onImageUpload, onYoutubeClick }) => {
  if (!editor) return null

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: 'left-start',
        offset: [0, 8],
      }}
      shouldShow={({ state }) => {
        const { $from } = state.selection
        const currentLineText = $from.nodeBefore?.textContent || ''
        const isEmptyLine = $from.parent.isTextblock && $from.parent.textContent === ''
        return isEmptyLine && !currentLineText
      }}
    >
      <div className="py-1.5 px-1 min-w-[180px] rounded-lg bg-white border border-medium-border shadow-lg">
        <FloatingButton
          icon={FaHeading}
          label="Tiêu đề"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <FloatingButton
          icon={FaImage}
          label="Hình ảnh"
          onClick={onImageUpload}
        />
        <FloatingButton
          icon={FaCode}
          label="Khối mã"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <FloatingButton
          icon={FaTable}
          label="Bảng"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <FloatingButton
          icon={FaYoutube}
          label="Video YouTube"
          onClick={onYoutubeClick}
        />
        <FloatingButton
          icon={FaQuoteRight}
          label="Trích dẫn"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <FloatingButton
          icon={FaMinus}
          label="Đường kẻ ngang"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
        <FloatingButton
          icon={FaTasks}
          label="Danh sách việc cần làm"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        />
      </div>
    </FloatingMenu>
  )
}

export default FloatingToolbar
