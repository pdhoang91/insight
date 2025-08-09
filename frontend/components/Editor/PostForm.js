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

const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTitle, setIsUploadingTitle] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(!content || content.trim() === '');
  const [isPreview, setIsPreview] = useState(false);

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
        icon: FaBold,
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: () => editor.isActive('bold'),
        tooltip: 'Đậm',
      },
      {
        icon: FaItalic,
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => editor.isActive('italic'),
        tooltip: 'Nghiêng',
      },
      {
        icon: FaUnderline,
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: () => editor.isActive('underline'),
        tooltip: 'Gạch chân',
      },
      {
        icon: FaStrikethrough,
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => editor.isActive('strike'),
        tooltip: 'Gạch ngang',
      },
      // Nhóm Căn Chỉnh Văn Bản
      {
        icon: FaAlignJustify,
        action: () => editor.chain().focus().setTextAlign('justify').run(),
        isActive: () => editor.isActive({ textAlign: 'justify' }),
        tooltip: 'Căn đều hai bên',
      },
      {
        icon: FaAlignLeft,
        action: () => editor.chain().focus().setTextAlign('left').run(),
        isActive: () => editor.isActive({ textAlign: 'left' }),
        tooltip: 'Căn trái',
      },
      {
        icon: FaAlignCenter,
        action: () => editor.chain().focus().setTextAlign('center').run(),
        isActive: () => editor.isActive({ textAlign: 'center' }),
        tooltip: 'Căn giữa',
      },
      {
        icon: FaAlignRight,
        action: () => editor.chain().focus().setTextAlign('right').run(),
        isActive: () => editor.isActive({ textAlign: 'right' }),
        tooltip: 'Căn phải',
      },
      // Nhóm Chèn Đối Tượng
      {
        icon: FaImage,
        action: handleImageUpload,
        isActive: false,
        tooltip: 'Chèn hình ảnh',
      },
      {
        icon: FaLink,
        action: () => {
          const url = prompt('Nhập URL');
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        },
        isActive: () => editor.isActive('link'),
        tooltip: 'Chèn liên kết',
      },
      // Nhóm Tổ Chức Nội Dung
      {
        icon: FaListUl,
        action: () => {
          editor.chain().focus().toggleBulletList().run();
          console.log('Bullet List toggled:', editor.isActive('bulletList'));
        },
        isActive: () => editor.isActive('bulletList'),
        tooltip: 'Danh sách không thứ tự',
      },
      {
        icon: FaListOl,
        action: () => {
          editor.chain().focus().toggleOrderedList().run();
          console.log('Ordered List toggled:', editor.isActive('orderedList'));
        },
        isActive: () => editor.isActive('orderedList'),
        tooltip: 'Danh sách có thứ tự',
      },
      {
        icon: FaHeading,
        tooltip: 'Chỉnh cấp độ tiêu đề',
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
        icon: FaQuoteRight,
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.isActive('blockquote'),
        tooltip: 'Trích dẫn',
      },
      {
        icon: FaEraser,
        action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
        isActive: false,
        tooltip: 'Xóa định dạng',
      },
      {
        icon: isPreview ? FaEyeSlash : FaEye,
        action: () => setIsPreview((prev) => !prev),
        isActive: false,
        tooltip: isPreview ? 'Thoát chế độ xem trước' : 'Chế độ xem trước',
      },
    ];
  }, [editor, isPreview, handleImageUpload, setIsPreview]);

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
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 relative card-content">
      {/* Tiêu đề và Hình ảnh tiêu đề */}
      <TitleInput
        title={title}
        setTitle={setTitle}
        imageTitle={imageTitle}
        handleImageTitleUpload={handleImageTitleUpload}
        isUploadingTitle={isUploadingTitle}
      />

      {/* Container Scrollable Cho Toolbar và Nội Dung */}
      <div
        className="h-[600px] overflow-y-auto editor-container"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 transparent',
        }}
      >
        {/* Thanh công cụ (Toolbar) */}
        <Toolbar menuBar={menuBar} editor={editor} isPreview={isPreview} setIsPreview={setIsPreview} />

        {/* Nội dung bài viết */}
        <ContentEditor
          editor={editor}
          isPreview={isPreview}
          content={content}
          isUploading={isUploading}
        />
      </div>
    </form>
  );
};

export default PostForm;
