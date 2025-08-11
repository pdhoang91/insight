// components/Editor/PostForm.js
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadImage } from '../../services/imageService';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaQuoteRight,
  FaLink,
  FaImage,
  FaUpload,
  FaEraser,
  FaEye,
  FaEyeSlash,
  FaListUl,
  FaListOl,
  FaHeading,
  FaSave,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
} from 'react-icons/fa';
import Toolbar from './Toolbar';
import TitleInput from './TitleInput';
import ContentEditor from './ContentEditor';
import 'tippy.js/dist/tippy.css';

const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle, isFullscreen = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTitle, setIsUploadingTitle] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(!content || content.trim() === '');

  // Thêm useRef để kiểm soát vòng lặp
  const isGeneratingTOC = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5], // Hỗ trợ từ H1 đến H5
          HTMLAttributes: {
            id: null, // Đảm bảo không có ID mặc định
          },
        },
      }),
      Image,
      Link,
      TextStyle,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Nội dung bài viết...',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      // Nếu đang trong quá trình generate TOC, không thực hiện lại
      if (isGeneratingTOC.current) return;

      const html = editor.getHTML();
      setContent(html);
      setIsContentEmpty(!html || html.trim() === '');
    },
  });

  useEffect(() => {
    if (editor) {
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content || '');
        setIsContentEmpty(!content || content.trim() === '');
      }
    }
  }, [content, editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file, 'content');
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        console.error('Error uploading image', error);
        alert('Đã xảy ra lỗi khi tải lên hình ảnh.');
      } finally {
        setIsUploading(false);
      }
    };
  }, [editor]);

  const handleImageTitleUpload = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setIsUploadingTitle(true);
      try {
        const uploadedUrl = await uploadImage(file, 'title');
        setImageTitle(uploadedUrl);
      } catch (error) {
        console.error('Error uploading image title', error);
        alert('Đã xảy ra lỗi khi tải lên ảnh tiêu đề.');
      } finally {
        setIsUploadingTitle(false);
      }
    };
  }, [setImageTitle]);

  const menuBar = useMemo(() => {
    if (!editor) return [];

    return [
      // Nhóm Định Dạng Văn Bản
      {
        name: 'bold',
        icon: FaBold,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive('bold'),
        tooltip: 'Bold',
        essential: true,
      },
      {
        name: 'italic',
        icon: FaItalic,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive('italic'),
        tooltip: 'Italic',
        essential: true,
      },
      {
        name: 'underline',
        icon: FaUnderline,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: () => editor.isActive('underline'),
        tooltip: 'Underline',
      },
      {
        name: 'strike',
        icon: FaStrikethrough,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive('strike'),
        tooltip: 'Strikethrough',
      },
      // Nhóm Căn Chỉnh Văn Bản
      {
        name: 'alignJustify',
        icon: FaAlignJustify,
        action: () => editor.chain().focus().setTextAlign('justify').run(),
        isActive: () => editor.isActive({ textAlign: 'justify' }),
        tooltip: 'Justify',
      },
      {
        name: 'alignLeft',
        icon: FaAlignLeft,
        action: () => editor.chain().focus().setTextAlign('left').run(),
        isActive: () => editor.isActive({ textAlign: 'left' }),
        tooltip: 'Align Left',
      },
      {
        name: 'alignCenter',
        icon: FaAlignCenter,
        action: () => editor.chain().focus().setTextAlign('center').run(),
        isActive: () => editor.isActive({ textAlign: 'center' }),
        tooltip: 'Align Center',
      },
      {
        name: 'alignRight',
        icon: FaAlignRight,
        action: () => editor.chain().focus().setTextAlign('right').run(),
        isActive: () => editor.isActive({ textAlign: 'right' }),
        tooltip: 'Align Right',
      },
      // Nhóm Chèn Đối Tượng
      {
        name: 'image',
        icon: FaImage,
        action: handleImageUpload,
        isActive: false,
        tooltip: 'Insert Image',
      },
      {
        name: 'link',
        icon: FaLink,
        action: () => {
          const url = prompt('Enter URL');
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        },
        isActive: () => editor.isActive('link'),
        tooltip: 'Insert Link',
      },
      // Nhóm Tổ Chức Nội Dung
      {
        name: 'bulletList',
        icon: FaListUl,
        action: () => {
          editor.chain().focus().toggleBulletList().run();
          console.log('Bullet List toggled:', editor.isActive('bulletList'));
        },
        isActive: () => editor.isActive('bulletList'),
        tooltip: 'Bullet List',
        essential: true,
      },
      {
        name: 'orderedList',
        icon: FaListOl,
        action: () => {
          editor.chain().focus().toggleOrderedList().run();
          console.log('Ordered List toggled:', editor.isActive('orderedList'));
        },
        isActive: () => editor.isActive('orderedList'),
        tooltip: 'Numbered List',
        essential: true,
      },
      {
        name: 'heading',
        icon: FaHeading,
        tooltip: 'Heading',
        essential: true,
        children: (
          <div className="py-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  editor.chain().focus().toggleHeading({ level }).run();
                  console.log(`Heading ${level} toggled:`, editor.isActive('heading', { level }));
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 
                  ${editor.isActive('heading', { level }) ? 'bg-blue-100' : ''}`}
              >
                Heading {level}
              </button>
            ))}
          </div>
        ),
      },
      // Nhóm Hỗ Trợ
      {
        name: 'blockquote',
        icon: FaQuoteRight,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.isActive('blockquote'),
        tooltip: 'Quote',
        essential: true,
      },
      {
        name: 'clearFormat',
        icon: FaEraser,
        action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
        isActive: false,
        tooltip: 'Clear Format',
      },
    ];
  }, [editor, handleImageUpload]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!title.trim() || isContentEmpty) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.');
      return;
    }

    const postData = {
      title,
      imageTitle,
      content,
    };
    console.log('Đăng bài viết:', postData);
    // Gửi dữ liệu đến backend tại đây
  };

  return (
    <div className={`w-full transition-all duration-300 max-w-6xl mx-auto`}>
      <div className={`p-1`}>
        {/* Title Input Section */}
        <div className="mb-6">
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
        <div className={`transition-all duration-300 ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'min-h-[70vh]'}`}>
          {/* Toolbar - Only show in non-focus mode or on hover in focus mode */}
          <div className={`transition-all duration-300 mb-4`}>
            <Toolbar 
              menuBar={menuBar} 
              editor={editor} 
            />
          </div>

          {/* Content Editor */}
          <div className={`transition-all duration-300 ${isFullscreen ? 'h-[calc(100%-4rem)]' : ''} overflow-y-auto`}>
            <ContentEditor
              editor={editor}
              isPreview={false}
              content={content}
              isUploading={isUploading}
              focusMode={false}
              isFullscreen={isFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
