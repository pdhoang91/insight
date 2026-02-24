import React, { useState, useRef, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import { FaTable } from 'react-icons/fa'
import { themeClasses, combineClasses } from '../../utils/themeClasses'
import 'tippy.js/dist/tippy.css'

const MAX_ROWS = 6
const MAX_COLS = 6

const TableMenu = ({ editor, disabled, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoverRow, setHoverRow] = useState(0)
  const [hoverCol, setHoverCol] = useState(0)
  const ref = useRef()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInsert = (rows, cols) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setIsOpen(false)
  }

  const buttonClasses = combineClasses(
    compact ? 'p-1' : 'p-1.5',
    themeClasses.effects.rounded,
    'flex items-center justify-center',
    themeClasses.interactive.base,
    themeClasses.interactive.touchTarget,
    editor?.isActive('table')
      ? combineClasses(themeClasses.bg.accent, 'text-white', themeClasses.effects.shadow)
      : combineClasses(themeClasses.text.secondary, themeClasses.text.accentHover, 'hover:bg-medium-hover'),
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  )

  return (
    <div className={themeClasses.utils.relative} ref={ref}>
      <Tippy content="Chèn bảng" placement="top" disabled={compact}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={buttonClasses}
          aria-label="Chèn bảng"
          title="Chèn bảng"
        >
          <FaTable className={compact ? themeClasses.icons.xs : themeClasses.icons.sm} />
        </button>
      </Tippy>
      {isOpen && (
        <div className={combineClasses(
          themeClasses.utils.absolute,
          'left-0 mt-2 z-20 p-3',
          themeClasses.bg.card,
          'border',
          themeClasses.border.primary,
          themeClasses.effects.rounded,
          themeClasses.effects.shadowLayeredLg
        )}>
          <div className="mb-2 text-xs text-medium-text-secondary text-center">
            {hoverRow > 0 ? `${hoverRow} × ${hoverCol}` : 'Chọn kích thước'}
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}>
            {Array.from({ length: MAX_ROWS }, (_, r) =>
              Array.from({ length: MAX_COLS }, (_, c) => (
                <button
                  key={`${r}-${c}`}
                  className={combineClasses(
                    'w-5 h-5 border rounded-sm transition-colors',
                    r < hoverRow && c < hoverCol
                      ? 'bg-medium-accent-green/30 border-medium-accent-green'
                      : 'bg-medium-bg-secondary border-medium-border'
                  )}
                  onMouseEnter={() => { setHoverRow(r + 1); setHoverCol(c + 1) }}
                  onMouseLeave={() => { setHoverRow(0); setHoverCol(0) }}
                  onClick={() => handleInsert(r + 1, c + 1)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TableMenu
