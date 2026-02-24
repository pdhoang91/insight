import React, { useState, useRef, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import { themeClasses, combineClasses } from '../../utils/themeClasses'
import 'tippy.js/dist/tippy.css'

const PRESET_COLORS = [
  { label: 'Mặc định', value: null },
  { label: 'Đỏ', value: '#ef4444' },
  { label: 'Cam', value: '#f97316' },
  { label: 'Vàng', value: '#eab308' },
  { label: 'Xanh lá', value: '#22c55e' },
  { label: 'Xanh dương', value: '#3b82f6' },
  { label: 'Tím', value: '#a855f7' },
  { label: 'Hồng', value: '#ec4899' },
  { label: 'Xám', value: '#6b7280' },
]

const HIGHLIGHT_COLORS = [
  { label: 'Không', value: null },
  { label: 'Vàng', value: '#fef08a' },
  { label: 'Xanh lá', value: '#bbf7d0' },
  { label: 'Xanh dương', value: '#bfdbfe' },
  { label: 'Tím', value: '#e9d5ff' },
  { label: 'Hồng', value: '#fce7f3' },
  { label: 'Cam', value: '#fed7aa' },
  { label: 'Đỏ', value: '#fecaca' },
  { label: 'Xám', value: '#e5e7eb' },
]

const ColorPicker = ({ icon: Icon, tooltip, onSelect, colors, activeColor, disabled, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef()
  const palette = colors || PRESET_COLORS

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const buttonClasses = combineClasses(
    compact ? 'p-1' : 'p-1.5',
    themeClasses.effects.rounded,
    'flex items-center justify-center gap-0.5',
    themeClasses.interactive.base,
    themeClasses.interactive.touchTarget,
    activeColor
      ? combineClasses(themeClasses.bg.accent, 'text-white', themeClasses.effects.shadow)
      : combineClasses(themeClasses.text.secondary, themeClasses.text.accentHover, 'hover:bg-medium-hover'),
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  )

  return (
    <div className={themeClasses.utils.relative} ref={ref}>
      <Tippy content={tooltip} placement="top" disabled={compact}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={buttonClasses}
          aria-label={tooltip}
          title={tooltip}
        >
          <Icon className={compact ? themeClasses.icons.xs : themeClasses.icons.sm} />
          {activeColor && (
            <span
              className="w-2 h-2 rounded-full border border-white/50"
              style={{ backgroundColor: activeColor }}
            />
          )}
        </button>
      </Tippy>
      {isOpen && (
        <div className={combineClasses(
          themeClasses.utils.absolute,
          'left-0 mt-2 z-20 p-2',
          themeClasses.bg.card,
          'border',
          themeClasses.border.primary,
          themeClasses.effects.rounded,
          themeClasses.effects.shadowLayeredLg
        )}>
          <div className="grid grid-cols-5 gap-1.5">
            {palette.map((color, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelect(color.value)
                  setIsOpen(false)
                }}
                className={combineClasses(
                  'w-7 h-7 rounded-md border-2 transition-transform hover:scale-110',
                  activeColor === color.value ? 'border-medium-accent-green ring-1 ring-medium-accent-green' : 'border-transparent'
                )}
                style={{ backgroundColor: color.value || 'transparent' }}
                title={color.label}
              >
                {!color.value && (
                  <span className="text-xs text-medium-text-secondary">✕</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { PRESET_COLORS, HIGHLIGHT_COLORS }
export default ColorPicker
