import React, { useState, useRef, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import { FaCode } from 'react-icons/fa'
import { themeClasses, combineClasses } from '../../utils/themeClasses'
import 'tippy.js/dist/tippy.css'

const LANGUAGES = [
  { label: 'Plain text', value: 'plaintext' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Java', value: 'java' },
  { label: 'C', value: 'c' },
  { label: 'C++', value: 'cpp' },
  { label: 'HTML', value: 'xml' },
  { label: 'CSS', value: 'css' },
  { label: 'SQL', value: 'sql' },
  { label: 'Bash', value: 'bash' },
  { label: 'JSON', value: 'json' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'PHP', value: 'php' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
]

const CodeBlockSelector = ({ editor, disabled, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)
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

  const handleSelect = (language) => {
    editor.chain().focus().toggleCodeBlock({ language }).run()
    setIsOpen(false)
  }

  const isActive = editor?.isActive('codeBlock')

  const buttonClasses = combineClasses(
    compact ? 'p-1' : 'p-1.5',
    themeClasses.effects.rounded,
    'flex items-center justify-center',
    themeClasses.interactive.base,
    themeClasses.interactive.touchTarget,
    isActive
      ? combineClasses(themeClasses.bg.accent, 'text-white', themeClasses.effects.shadow)
      : combineClasses(themeClasses.text.secondary, themeClasses.text.accentHover, 'hover:bg-medium-hover'),
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  )

  return (
    <div className={themeClasses.utils.relative} ref={ref}>
      <Tippy content="Khối mã" placement="top" disabled={compact}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={buttonClasses}
          aria-label="Khối mã"
          title="Khối mã"
        >
          <FaCode className={compact ? themeClasses.icons.xs : themeClasses.icons.sm} />
        </button>
      </Tippy>
      {isOpen && (
        <div className={combineClasses(
          themeClasses.utils.absolute,
          'left-0 mt-2 z-20 w-44 max-h-64 overflow-y-auto',
          themeClasses.bg.card,
          'border',
          themeClasses.border.primary,
          themeClasses.effects.rounded,
          themeClasses.effects.shadowLayeredLg
        )}>
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleSelect(lang.value)}
                className={combineClasses(
                  'w-full text-left px-3 py-1.5 text-sm',
                  themeClasses.text.bodySmall,
                  'hover:bg-medium-hover',
                  themeClasses.animations.smooth,
                  editor?.isActive('codeBlock', { language: lang.value }) ? 'bg-medium-accent-green/20' : ''
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeBlockSelector
