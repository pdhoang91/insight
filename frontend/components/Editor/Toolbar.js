import React from 'react'
import ToolbarButton from './ToolbarButton'
import ToolbarSeparator from './ToolbarSeparator'
import ColorPicker, { PRESET_COLORS, HIGHLIGHT_COLORS } from './ColorPicker'
import TableMenu from './TableMenu'
import CodeBlockSelector from './CodeBlockSelector'

const Toolbar = ({ menuBar, editor, compact = false }) => {
  const essentialTools = ['bold', 'italic', 'heading', 'bulletList', 'orderedList', 'blockquote']

  const filteredMenuBar = compact
    ? menuBar.filter(item => item.type === 'separator' || essentialTools.includes(item.name) || item.essential)
    : menuBar

  return (
    <div className={`sticky top-16 z-10 bg-white/90 backdrop-blur-sm border-b border-medium-border ${compact ? 'p-2' : 'p-2.5'}`}>
      <div className="overflow-x-auto scrollbar-hide">
        <div className={`flex items-center ${compact ? 'gap-0.5' : 'gap-1'} min-w-max`}>
          {filteredMenuBar.map((item, index) => {
            if (item.type === 'separator') {
              return <ToolbarSeparator key={item.name} />
            }

            if (item.type === 'color') {
              return (
                <ColorPicker
                  key={item.name}
                  icon={item.icon}
                  tooltip={item.tooltip}
                  colors={PRESET_COLORS}
                  activeColor={item.getActiveColor?.()}
                  onSelect={item.onSelect}
                  disabled={!editor}
                  compact={compact}
                />
              )
            }

            if (item.type === 'highlight') {
              return (
                <ColorPicker
                  key={item.name}
                  icon={item.icon}
                  tooltip={item.tooltip}
                  colors={HIGHLIGHT_COLORS}
                  activeColor={item.getActiveColor?.()}
                  onSelect={item.onSelect}
                  disabled={!editor}
                  compact={compact}
                />
              )
            }

            if (item.type === 'table') {
              return (
                <TableMenu
                  key={item.name}
                  editor={editor}
                  disabled={!editor}
                  compact={compact}
                />
              )
            }

            if (item.type === 'codeBlock') {
              return (
                <CodeBlockSelector
                  key={item.name}
                  editor={editor}
                  disabled={!editor}
                  compact={compact}
                />
              )
            }

            if (item.children) {
              return (
                <ToolbarButton
                  key={item.name}
                  icon={item.icon}
                  isActive={item.isActive ? item.isActive() : false}
                  tooltip={item.tooltip}
                  disabled={!editor}
                  compact={compact}
                >
                  {item.children}
                </ToolbarButton>
              )
            }

            return (
              <ToolbarButton
                key={item.name}
                icon={item.icon}
                onClick={item.action}
                isActive={item.isActive ? item.isActive() : false}
                tooltip={item.tooltip}
                disabled={!editor}
                compact={compact}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Toolbar
