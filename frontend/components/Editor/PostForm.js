// components/Editor/PostForm.js
'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { getExtensions } from '../../utils/tiptapExtensions'
import SlashCommands from './extensions/SlashCommands'
import { uploadImage } from '../../services/imageService'
import TitleInput from './TitleInput'
import ContentEditor from './ContentEditor'
import LinkDialog from './LinkDialog'
import YouTubeDialog from './YouTubeDialog'
import BubbleToolbar from './BubbleToolbar'
import FloatingToolbar from './FloatingToolbar'
import { useTranslations } from 'next-intl'

const PostForm = ({ title, setTitle, content, setContent, isFullscreen = false }) => {
  const t = useTranslations()
  const [isUploading, setIsUploading] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false)

  const isGeneratingTOC = useRef(false)

  const editor = useEditor({
    extensions: [
      ...getExtensions(),
      Placeholder.configure({
        placeholder: t('editor.storyPlaceholder'),
      }),
      CharacterCount,
      SlashCommands,
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (isGeneratingTOC.current) return
      const json = editor.getJSON()
      setContent(json)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh]',
        style: 'font-family: var(--font-body); color: var(--text); line-height: 1.72;',
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (files?.length) {
          const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
          if (imageFiles.length) {
            event.preventDefault()
            imageFiles.forEach(file => handleDroppedImage(file))
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              event.preventDefault()
              const file = item.getAsFile()
              if (file) handleDroppedImage(file)
              return true
            }
          }
        }
        return false
      },
    },
  })

  const handleDroppedImage = useCallback(async (file) => {
    if (!editor) return
    setIsUploading(true)
    try {
      const imageUrl = await uploadImage(file, 'content')
      editor.commands.setImageBlock({ src: imageUrl, alignment: 'center', width: '100%' })
    } catch (error) {
      console.error('Error uploading image', error)
    } finally {
      setIsUploading(false)
    }
  }, [editor])

  useEffect(() => {
    if (editor && content) {
      const currentJSON = JSON.stringify(editor.getJSON())
      const incomingJSON = typeof content === 'string' ? content : JSON.stringify(content)
      if (incomingJSON !== currentJSON) {
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return
      setIsUploading(true)
      try {
        const imageUrl = await uploadImage(file, 'content')
        editor.commands.setImageBlock({ src: imageUrl, alignment: 'center', width: '100%' })
      } catch (error) {
        console.error('Error uploading image', error)
        alert(t('editor.uploadError'))
      } finally {
        setIsUploading(false)
      }
    }
  }, [editor])

  const charCount = editor?.storage.characterCount
  const wordCount = charCount?.words?.() || 0

  const springConfig = { type: 'spring', stiffness: 100, damping: 20 }

  return (
    <motion.div
      className="w-full max-w-[720px] mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springConfig}
    >
      {/* Title */}
      <TitleInput
        title={title}
        setTitle={setTitle}
        placeholder={t('editor.titlePlaceholder')}
      />

      {/* Editor */}
      <ContentEditor
        editor={editor}
        isUploading={isUploading}
        uploadingText={t('editor.uploadingImage')}
      />

      {/* Bubble & Floating Menus */}
      {editor && (
        <>
          <BubbleToolbar
            editor={editor}
            onLinkClick={() => setShowLinkDialog(true)}
          />
          <FloatingToolbar
            editor={editor}
            onImageUpload={handleImageUpload}
            onYoutubeClick={() => setShowYoutubeDialog(true)}
          />
        </>
      )}

      {/* Floating word count chip */}
      <AnimatePresence>
        {wordCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={springConfig}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.5rem',
              float: 'right',
              padding: '0.3rem 0.75rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '99px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              color: 'var(--text-faint)',
            }}
          >
            <span>{wordCount.toLocaleString()} {t('editor.words')}</span>
            <span style={{
              width: '1px',
              height: '0.75rem',
              background: 'var(--border)',
              display: 'inline-block',
            }} />
            <span>{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      {showLinkDialog && (
        <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />
      )}
      {showYoutubeDialog && (
        <YouTubeDialog editor={editor} onClose={() => setShowYoutubeDialog(false)} />
      )}
    </motion.div>
  )
}

export default PostForm
