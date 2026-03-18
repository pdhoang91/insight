// components/Editor/PostForm.js
import React, { useEffect, useState, useCallback, useRef } from 'react'
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

const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle, isFullscreen = false }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingTitle, setIsUploadingTitle] = useState(false)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false)

  const isGeneratingTOC = useRef(false)

  const editor = useEditor({
    extensions: [
      ...getExtensions(),
      Placeholder.configure({
        placeholder: 'Tell your story...',
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
        alert('Đã xảy ra lỗi khi tải lên hình ảnh.')
      } finally {
        setIsUploading(false)
      }
    }
  }, [editor])

  const handleImageTitleUpload = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return
      setIsUploadingTitle(true)
      try {
        const uploadedUrl = await uploadImage(file, 'title')
        setImageTitle(uploadedUrl)
      } catch (error) {
        console.error('Error uploading image title', error)
        alert('Đã xảy ra lỗi khi tải lên ảnh tiêu đề.')
      } finally {
        setIsUploadingTitle(false)
      }
    }
  }, [setImageTitle])

  const charCount = editor?.storage.characterCount
  const wordCount = charCount?.words?.() || 0

  return (
    <div className="w-full max-w-[720px] mx-auto">
      {/* Title */}
      <TitleInput
        title={title}
        setTitle={setTitle}
        imageTitle={imageTitle}
        setImageTitle={setImageTitle}
        handleImageTitleUpload={handleImageTitleUpload}
        isUploadingTitle={isUploadingTitle}
      />

      {/* Editor */}
      <ContentEditor
        editor={editor}
        isUploading={isUploading}
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

      {editor && wordCount > 0 && (
        <div style={{ textAlign: 'right', marginTop: '1.5rem', fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          {wordCount} words
        </div>
      )}

      {/* Dialogs */}
      {showLinkDialog && (
        <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />
      )}
      {showYoutubeDialog && (
        <YouTubeDialog editor={editor} onClose={() => setShowYoutubeDialog(false)} />
      )}
    </div>
  )
}

export default PostForm
