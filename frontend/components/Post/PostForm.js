// // // export default PostForm;
// export default PostForm;
// components/Post/PostForm.js
import React, { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
//import ImageUpload from './ImageUploadExtension';
import { uploadImage } from '../../services/imageService';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaQuoteRight, FaLink, FaImage, FaUpload } from 'react-icons/fa';

const ToolbarButton = ({ icon: Icon, onClick, isActive, tooltip, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded hover:bg-blue-100 focus:outline-none ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-label={tooltip}
    title={tooltip}
  >
    <Icon />
  </button>
);

const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle }) => { // Nhận imageTitle và setImageTitle từ props
  const [isUploading, setIsUploading] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(true);
  const [isUploadingTitle, setIsUploadingTitle] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      //ImageUpload,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setIsContentEmpty(html.trim() === '');
    },
  });

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        console.error("Error uploading image", error);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleImageTitleUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      setIsUploadingTitle(true);
      try {
        const uploadedUrl = await uploadImage(file);
        setImageTitle(uploadedUrl); // Cập nhật imageTitle thông qua setImageTitle từ props
      } catch (error) {
        console.error("Error uploading image title", error);
      } finally {
        setIsUploadingTitle(false);
      }
    };
  };

  const menuBar = useMemo(() => {
    if (!editor) return [];

    return [
      { icon: FaBold, action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold'), tooltip: 'Đậm' },
      { icon: FaItalic, action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic'), tooltip: 'Nghiêng' },
      { icon: FaUnderline, action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => editor.isActive('underline'), tooltip: 'Gạch chân' },
      { icon: FaStrikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: () => editor.isActive('strike'), tooltip: 'Gạch ngang' },
      { icon: FaQuoteRight, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote'), tooltip: 'Trích dẫn' },
      {
        icon: FaLink,
        action: () => {
          const url = prompt('Nhập URL');
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        },
        isActive: () => editor.isActive('link'),
        tooltip: 'Chèn liên kết',
      },
      { icon: FaImage, action: handleImageUpload, isActive: false, tooltip: 'Chèn hình ảnh' },
    ];
  }, [editor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra các trường bắt buộc
    if (!title.trim() || isContentEmpty) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.");
      return;
    }

    // Tạo đối tượng bài viết
    const postData = {
      title,
      imageTitle,
      content,
      // Các trường khác nếu có
    };

    // Gửi dữ liệu lên server
    // Ví dụ: postService.createPost(postData).then(...).catch(...);
    console.log("Post Data:", postData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 relative">
      {/* Ô Nhập Tiêu Đề với Icon Upload */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full pr-10 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="tiêu đề bài viết..."
          />
          {/* Icon Upload */}
          <button
            type="button"
            onClick={handleImageTitleUpload}
            className="absolute right-0 top-0 mt-3 mr-3 text-gray-500 hover:text-blue-500"
            aria-label="Upload Image Title"
            title="Tải lên ảnh tiêu đề"
          >
            {isUploadingTitle ? (
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : imageTitle ? (
              <img src={imageTitle} alt="Image Title" className="w-5 h-5 object-cover rounded-full" />
            ) : (
              <FaUpload />
            )}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4">
        <div className="flex items-center justify-center space-x-2 p-2">
          {menuBar.map((item) => (
            <ToolbarButton
              key={item.tooltip}
              icon={item.icon}
              onClick={item.action}
              isActive={item.isActive ? item.isActive() : false}
              tooltip={item.tooltip}
              disabled={!editor}
            />
          ))}
        </div>
      </div>

      {/* Nội Dung Bài Viết */}
      <div className="mb-4 p-4 min-h-[300px] relative">
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
        )}
        {editor ? (
          <>
            <EditorContent editor={editor} />
            {isContentEmpty && (
              <p className="absolute text-gray-500 italic top-4 left-4 pointer-events-none">nội dung bài viết...</p>
            )}
          </>
        ) : (
          <p className="text-gray-400">Loading editor...</p>
        )}
      </div>
    </form>
  );
};

export default PostForm;

