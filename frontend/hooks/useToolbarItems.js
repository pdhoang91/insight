import { useMemo, useState, useCallback } from 'react'
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaQuoteRight,
  FaLink,
  FaImage,
  FaEraser,
  FaListUl,
  FaListOl,
  FaHeading,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaMinus,
  FaUndo,
  FaRedo,
  FaSubscript,
  FaSuperscript,
  FaHighlighter,
  FaPalette,
  FaYoutube,
  FaTasks,
} from 'react-icons/fa'
import { themeClasses, combineClasses } from '../utils/themeClasses'

const useToolbarItems = (editor, { onImageUpload, onLinkClick, onYoutubeClick }) => {
  const menuBar = useMemo(() => {
    if (!editor) return []

    return [
      // --- Text formatting ---
      {
        name: 'bold',
        icon: FaBold,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive('bold'),
        tooltip: 'Đậm',
        essential: true,
        group: 'format',
      },
      {
        name: 'italic',
        icon: FaItalic,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive('italic'),
        tooltip: 'Nghiêng',
        essential: true,
        group: 'format',
      },
      {
        name: 'underline',
        icon: FaUnderline,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: () => editor.isActive('underline'),
        tooltip: 'Gạch chân',
        group: 'format',
      },
      {
        name: 'strike',
        icon: FaStrikethrough,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive('strike'),
        tooltip: 'Gạch ngang',
        group: 'format',
      },

      // --- Separator ---
      { name: 'sep-1', type: 'separator' },

      // --- Heading ---
      {
        name: 'heading',
        icon: FaHeading,
        tooltip: 'Tiêu đề',
        essential: true,
        group: 'heading',
        children: (
          <div className="py-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  editor.chain().focus().toggleHeading({ level }).run()
                }}
                className={combineClasses(
                  'w-full text-left px-4 py-2',
                  themeClasses.text.bodySmall,
                  'hover:bg-medium-hover',
                  themeClasses.animations.smooth,
                  editor.isActive('heading', { level }) ? 'bg-medium-accent-green/20' : ''
                )}
              >
                Tiêu đề {level}
              </button>
            ))}
          </div>
        ),
      },

      // --- Color & Highlight (handled as special types in Toolbar) ---
      {
        name: 'color',
        type: 'color',
        icon: FaPalette,
        tooltip: 'Màu chữ',
        group: 'style',
        getActiveColor: () => editor.getAttributes('textStyle')?.color || null,
        onSelect: (color) => {
          if (color) {
            editor.chain().focus().setColor(color).run()
          } else {
            editor.chain().focus().unsetColor().run()
          }
        },
      },
      {
        name: 'highlight',
        type: 'highlight',
        icon: FaHighlighter,
        tooltip: 'Tô sáng',
        group: 'style',
        getActiveColor: () => editor.getAttributes('highlight')?.color || null,
        onSelect: (color) => {
          if (color) {
            editor.chain().focus().toggleHighlight({ color }).run()
          } else {
            editor.chain().focus().unsetHighlight().run()
          }
        },
      },

      // --- Separator ---
      { name: 'sep-2', type: 'separator' },

      // --- Lists ---
      {
        name: 'bulletList',
        icon: FaListUl,
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: () => editor.isActive('bulletList'),
        tooltip: 'Danh sách dấu đầu dòng',
        essential: true,
        group: 'list',
      },
      {
        name: 'orderedList',
        icon: FaListOl,
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: () => editor.isActive('orderedList'),
        tooltip: 'Danh sách số',
        essential: true,
        group: 'list',
      },
      {
        name: 'taskList',
        icon: FaTasks,
        action: () => editor.chain().focus().toggleTaskList().run(),
        isActive: () => editor.isActive('taskList'),
        tooltip: 'Danh sách việc cần làm',
        group: 'list',
      },

      // --- Separator ---
      { name: 'sep-3', type: 'separator' },

      // --- Alignment ---
      {
        name: 'alignLeft',
        icon: FaAlignLeft,
        action: () => editor.chain().focus().setTextAlign('left').run(),
        isActive: () => editor.isActive({ textAlign: 'left' }),
        tooltip: 'Căn trái',
        group: 'align',
      },
      {
        name: 'alignCenter',
        icon: FaAlignCenter,
        action: () => editor.chain().focus().setTextAlign('center').run(),
        isActive: () => editor.isActive({ textAlign: 'center' }),
        tooltip: 'Căn giữa',
        group: 'align',
      },
      {
        name: 'alignRight',
        icon: FaAlignRight,
        action: () => editor.chain().focus().setTextAlign('right').run(),
        isActive: () => editor.isActive({ textAlign: 'right' }),
        tooltip: 'Căn phải',
        group: 'align',
      },
      {
        name: 'alignJustify',
        icon: FaAlignJustify,
        action: () => editor.chain().focus().setTextAlign('justify').run(),
        isActive: () => editor.isActive({ textAlign: 'justify' }),
        tooltip: 'Căn đều',
        group: 'align',
      },

      // --- Separator ---
      { name: 'sep-4', type: 'separator' },

      // --- Insert ---
      {
        name: 'link',
        icon: FaLink,
        action: onLinkClick,
        isActive: () => editor.isActive('link'),
        tooltip: 'Chèn liên kết',
        group: 'insert',
      },
      {
        name: 'image',
        icon: FaImage,
        action: onImageUpload,
        isActive: false,
        tooltip: 'Chèn hình ảnh',
        group: 'insert',
      },
      {
        name: 'youtube',
        icon: FaYoutube,
        action: onYoutubeClick,
        isActive: false,
        tooltip: 'Chèn video YouTube',
        group: 'insert',
      },
      {
        name: 'table',
        type: 'table',
        tooltip: 'Chèn bảng',
        group: 'insert',
      },

      // --- Separator ---
      { name: 'sep-5', type: 'separator' },

      // --- Block ---
      {
        name: 'blockquote',
        icon: FaQuoteRight,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.isActive('blockquote'),
        tooltip: 'Trích dẫn',
        essential: true,
        group: 'block',
      },
      {
        name: 'codeBlock',
        type: 'codeBlock',
        tooltip: 'Khối mã',
        group: 'block',
      },
      {
        name: 'horizontalRule',
        icon: FaMinus,
        action: () => editor.chain().focus().setHorizontalRule().run(),
        isActive: false,
        tooltip: 'Đường kẻ ngang',
        group: 'block',
      },

      // --- Separator ---
      { name: 'sep-6', type: 'separator' },

      // --- Misc ---
      {
        name: 'subscript',
        icon: FaSubscript,
        action: () => editor.chain().focus().toggleSubscript().run(),
        isActive: () => editor.isActive('subscript'),
        tooltip: 'Chỉ số dưới',
        group: 'misc',
      },
      {
        name: 'superscript',
        icon: FaSuperscript,
        action: () => editor.chain().focus().toggleSuperscript().run(),
        isActive: () => editor.isActive('superscript'),
        tooltip: 'Chỉ số trên',
        group: 'misc',
      },
      {
        name: 'clearFormat',
        icon: FaEraser,
        action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
        isActive: false,
        tooltip: 'Xóa định dạng',
        group: 'misc',
      },

      // --- Separator ---
      { name: 'sep-7', type: 'separator' },

      // --- History ---
      {
        name: 'undo',
        icon: FaUndo,
        action: () => editor.chain().focus().undo().run(),
        isActive: false,
        tooltip: 'Hoàn tác',
        group: 'history',
      },
      {
        name: 'redo',
        icon: FaRedo,
        action: () => editor.chain().focus().redo().run(),
        isActive: false,
        tooltip: 'Làm lại',
        group: 'history',
      },
    ]
  }, [editor, onImageUpload, onLinkClick, onYoutubeClick])

  return menuBar
}

export default useToolbarItems
