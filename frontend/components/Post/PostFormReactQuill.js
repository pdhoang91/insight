// components/PostFormReactQuill.js
import { useState } from 'react';
import dynamic from 'next/dynamic';
import {useImage} from '../../hooks/useImage';
import 'react-quill/dist/quill.snow.css'; // Import CSS của Quill

// Sử dụng dynamic import để tránh lỗi khi server-side rendering
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export const PostFormReactQuill = ({ title, setTitle, content, setContent }) => {
  const [showToolbar, setShowToolbar] = useState(false);

  const [image, setImage] = useState(null);

  const { handleImageUpload } = useImage();


  // Tùy chỉnh thanh toolbar của Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];

  const handleImageUploadClick = async (file) => {
    const imageUrl = await handleImageUpload(file);
    const quill = this.quillRef.getEditor();
    const range = quill.getSelection();
    quill.insertEmbed(range.index, 'image', imageUrl);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white">
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none"
          placeholder="Enter post title..."
        />
      </div>

      <div className="mb-4">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          placeholder="Write your post content here..."
          className="h-40"
          onImageUpload={handleImageUploadClick}
        />
      </div>
    </div>
  );
};
