// components/Editor/PostForm.js
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { getExtensions } from '../../utils/tiptapExtensions'
import SlashCommands from './extensions/SlashCommands'
import { uploadImage } from '../../services/imageService'
import useToolbarItems from '../../hooks/useToolbarItems'
import Toolbar from './Toolbar'
import TitleInput from './TitleInput'
import ContentEditor from './ContentEditor'
import LinkDialog from './LinkDialog'
import YouTubeDialog from './YouTubeDialog'
import BubbleToolbar from './BubbleToolbar'
import FloatingToolbar from './FloatingToolbar'
import { themeClasses, combineClasses } from '../../utils/themeClasses'
import 'tippy.js/dist/tippy.css'

const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle, isFullscreen = false }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingTitle, setIsUploadingTitle] = useState(false)
  const [isContentEmpty, setIsContentEmpty] = useState(!content)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false)

  const isGeneratingTOC = useRef(false)

  const editor = useEditor({
    extensions: [
      ...getExtensions(),
      Placeholder.configure({
        placeholder: 'Nhập / để xem các lệnh...',
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
      setIsContentEmpty(editor.isEmpty)
    },
    editorProps: {
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
        setIsContentEmpty(editor.isEmpty)
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

  const menuBar = useToolbarItems(editor, {
    onImageUpload: handleImageUpload,
    onLinkClick: () => setShowLinkDialog(true),
    onYoutubeClick: () => setShowYoutubeDialog(true),
  })

  const charCount = editor?.storage.characterCount
  const wordCount = charCount?.words?.() || 0
  const characterCount = charCount?.characters?.() || 0

  return (
    <div className={combineClasses(
      'w-full max-w-6xl mx-auto',
      themeClasses.animations.smooth
    )}>
      <div className={themeClasses.spacing.cardSmall}>
        {/* Title Input Section */}
        <div className={themeClasses.spacing.marginBottom}>
          <TitleInput
            title={title}
            setTitle={setTitle}
            imageTitle={imageTitle}
            setImageTitle={setImageTitle}
            handleImageTitleUpload={handleImageTitleUpload}
            isUploadingTitle={isUploadingTitle}
          />
        </div>

        {/* Editor Section */}
        <div className={combineClasses(
          themeClasses.animations.smooth,
          isFullscreen ? 'h-[calc(100vh-8rem)]' : 'min-h-[70vh]'
        )}>
          {/* Toolbar */}
          <div className={combineClasses(
            themeClasses.animations.smooth,
            themeClasses.spacing.marginBottom
          )}>
            <Toolbar
              menuBar={menuBar}
              editor={editor}
            />
          </div>

          {/* Content Editor */}
          <div className={combineClasses(
            themeClasses.animations.smooth,
            isFullscreen ? 'h-[calc(100%-4rem)]' : '',
            'overflow-y-auto'
          )}>
            <ContentEditor
              editor={editor}
              content={content}
              isUploading={isUploading}
            />
          </div>

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

          {/* Word count */}
          {editor && (
            <div className={combineClasses(
              'flex justify-end mt-2 text-xs',
              themeClasses.text.secondary
            )}>
              {wordCount} từ · {characterCount} ký tự
            </div>
          )}
        </div>
      </div>

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
