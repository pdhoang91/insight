// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Image from '@tiptap/extension-image';
// import Link from '@tiptap/extension-link';
// import TextStyle from '@tiptap/extension-text-style';
// import Underline from '@tiptap/extension-underline';
// import { uploadImage } from '../../services/imageService';
// import {
//   FaBold,
//   FaItalic,
//   FaUnderline,
//   FaStrikethrough,
//   FaQuoteRight,
//   FaLink,
//   FaImage,
//   FaUpload,
//   FaEraser,
//   FaEye,
//   FaEyeSlash,
// } from 'react-icons/fa';

// const ToolbarButton = ({ icon: Icon, onClick, isActive, tooltip, disabled }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     className={`p-2 rounded hover:bg-blue-100 focus:outline-none ${
//       isActive ? 'bg-blue-500 text-white' : 'text-gray-700'
//     } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
//     aria-label={tooltip}
//     title={tooltip}
//   >
//     <Icon />
//   </button>
// );

// const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle }) => {
//   const [isUploading, setIsUploading] = useState(false);
//   const [isUploadingTitle, setIsUploadingTitle] = useState(false);
//   const [isContentEmpty, setIsContentEmpty] = useState(!content || content.trim() === '');
//   const [isPreview, setIsPreview] = useState(false);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Image,
//       Link,
//       TextStyle,
//       Underline,
//     ],
//     content: content || '',
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       setContent(html);
//       setIsContentEmpty(!html || html.trim() === '');
//     },
//   });

//   useEffect(() => {
//     if (editor) {
//       const currentContent = editor.getHTML();
//       if (content !== currentContent) {
//         editor.commands.setContent(content || '');
//         setIsContentEmpty(!content || content.trim() === '');
//       }
//     }
//   }, [content, editor]);

//   const handleImageUpload = useCallback(() => {
//     const input = document.createElement('input');
//     input.setAttribute('type', 'file');
//     input.setAttribute('accept', 'image/*');
//     input.click();

//     input.onchange = async () => {
//       const file = input.files[0];
//       if (!file) return;
//       setIsUploading(true);
//       try {
//         const imageUrl = await uploadImage(file, 'content');
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//       } catch (error) {
//         console.error('Error uploading image', error);
//         alert('Đã xảy ra lỗi khi tải lên hình ảnh.');
//       } finally {
//         setIsUploading(false);
//       }
//     };
//   }, [editor]);

//   const handleImageTitleUpload = useCallback(() => {
//     const input = document.createElement('input');
//     input.setAttribute('type', 'file');
//     input.setAttribute('accept', 'image/*');
//     input.click();

//     input.onchange = async () => {
//       const file = input.files[0];
//       if (!file) return;
//       setIsUploadingTitle(true);
//       try {
//         const uploadedUrl = await uploadImage(file, 'title');
//         setImageTitle(uploadedUrl);
//       } catch (error) {
//         console.error('Error uploading image title', error);
//         alert('Đã xảy ra lỗi khi tải lên ảnh tiêu đề.');
//       } finally {
//         setIsUploadingTitle(false);
//       }
//     };
//   }, [setImageTitle]);

//   const menuBar = useMemo(() => {
//     if (!editor) return [];

//     return [
//       { icon: FaBold, action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold'), tooltip: 'Đậm' },
//       { icon: FaItalic, action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic'), tooltip: 'Nghiêng' },
//       { icon: FaUnderline, action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => editor.isActive('underline'), tooltip: 'Gạch chân' },
//       { icon: FaStrikethrough, action: () => editor.chain().focus().toggleStrike().run(), isActive: () => editor.isActive('strike'), tooltip: 'Gạch ngang' },
//       { icon: FaQuoteRight, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote'), tooltip: 'Trích dẫn' },
//       {
//         icon: FaLink,
//         action: () => {
//           const url = prompt('Nhập URL');
//           if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
//         },
//         isActive: () => editor.isActive('link'),
//         tooltip: 'Chèn liên kết',
//       },
//       { icon: FaImage, action: handleImageUpload, isActive: false, tooltip: 'Chèn hình ảnh' },
//       {
//         icon: FaEraser,
//         action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
//         isActive: false,
//         tooltip: 'Xóa định dạng',
//       },
//       {
//         icon: isPreview ? FaEyeSlash : FaEye,
//         action: () => setIsPreview((prev) => !prev),
//         isActive: false,
//         tooltip: isPreview ? 'Thoát chế độ xem trước' : 'Chế độ xem trước',
//       },
//     ];
//   }, [editor, isPreview, handleImageUpload]);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!title.trim() || isContentEmpty) {
//       alert('Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.');
//       return;
//     }

//     const postData = {
//       title,
//       imageTitle,
//       content,
//     };
//     console.log('Đăng bài viết:', postData);
//     // Bạn có thể thực hiện gửi dữ liệu đến backend tại đây
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 relative">
//       <div className="mb-6">
//         <div className="relative">
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//             className="w-full pr-10 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
//             placeholder="Tiêu đề bài viết..."
//           />
//           <button
//             type="button"
//             onClick={handleImageTitleUpload}
//             className="absolute right-0 top-0 mt-3 mr-3 text-gray-500 hover:text-blue-500"
//             aria-label="Upload Image Title"
//             title="Tải lên ảnh tiêu đề"
//           >
//             {isUploadingTitle ? (
//               <svg
//                 className="animate-spin h-5 w-5 text-blue-500"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
//               </svg>
//             ) : imageTitle ? (
//               <img src={imageTitle} alt="Image Title" className="w-5 h-5 object-cover rounded-full" />
//             ) : (
//               <FaUpload />
//             )}
//           </button>
//         </div>
//       </div>

//       <div className="mb-4">
//         <div className="flex items-center justify-center space-x-2 p-2">
//           {menuBar.map((item, index) => (
//             <ToolbarButton
//               key={index}
//               icon={item.icon}
//               onClick={item.action}
//               isActive={item.isActive ? item.isActive() : false}
//               tooltip={item.tooltip}
//               disabled={!editor}
//             />
//           ))}
//         </div>
//       </div>

//       <div className="mb-4 p-4 min-h-[300px] relative">
//         {isUploading && (
//           <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
//             <svg
//               className="animate-spin h-8 w-8 text-blue-500"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
//             </svg>
//           </div>
//         )}
//         {editor && (
//           <>
//             {/* Loại bỏ FloatingMenu ở đây */}
//             {isPreview ? (
//               <div className="prose lg:prose-xl max-w-none mb-8">
//                 <div
//                   className="post-content"
//                   dangerouslySetInnerHTML={{ __html: content }}
//                 />
//               </div>
//             ) : (
//               <>
//                 <EditorContent editor={editor} />
//                 {isContentEmpty && (
//                   <p className="absolute text-gray-500 italic top-4 left-4 pointer-events-none">
//                     Nội dung bài viết...
//                   </p>
//                 )}
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </form>
//   );
// };

// export default PostForm;


// export default PostForm;
// Thành phần PostForm.js

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align'; // Import TextAlign
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
import ToolbarButton from './ToolbarButton';
import 'tippy.js/dist/tippy.css';

const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTitle, setIsUploadingTitle] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(!content || content.trim() === '');
  const [isPreview, setIsPreview] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [toc, setToc] = useState([]); // Table of Contents

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            id: null,
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
      // Thêm các extension khác nếu cần
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setIsContentEmpty(!html || html.trim() === '');
      generateTOC(editor);
      handleAutoSave(html);
    },
  });

  // Hàm tạo Table of Contents
  const generateTOC = (editorInstance) => {
    const headings = [];
    editorInstance.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const id = `heading-${pos}`;
        // Đảm bảo rằng heading có thuộc tính id
        editorInstance.commands.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          id,
        });
        headings.push({
          level: node.attrs.level,
          text: node.textContent,
          id,
        });
      }
    });
    setToc(headings);
  };

  // Hàm tự động lưu
  const handleAutoSave = useCallback(
    (htmlContent) => {
      // Giả sử bạn có API để tự động lưu
      // uploadAutoSave(htmlContent).then(() => setAutoSave(true));
      // Ở đây chỉ đơn giản là hiển thị trạng thái
      setAutoSave(true);
      setTimeout(() => setAutoSave(false), 2000);
    },
    []
  );

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
      {
        icon: FaAlignJustify,
        action: () => editor.chain().focus().setTextAlign('justify').run(),
        isActive: () => editor.isActive({ textAlign: 'justify' }),
        tooltip: 'Căn đều hai bên',
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
            {[1, 2, 3].map((level) => (
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
      {
        icon: FaSave,
        action: () => handleSubmit(null),
        isActive: false,
        tooltip: 'Lưu bài viết',
      },
    ];
  }, [editor, isPreview, handleImageUpload]);

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
    // Bạn có thể thực hiện gửi dữ liệu đến backend tại đây
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 relative bg-white">
      {/* Tiêu đề và Hình ảnh tiêu đề */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full pr-10 p-3 border border-gray-300 rounded text-gray-500 italic top-4 left-4 focus:outline-none focus:border-blue-500"
            placeholder="Tiêu đề bài viết..."
          />
          <button
            type="button"
            onClick={handleImageTitleUpload}
            className="absolute right-0 top-0 mt-3 mr-3 text-gray-500 hover:text-blue-500"
            aria-label="Upload Image Title"
            title="Tải lên ảnh tiêu đề"
          >
            {isUploadingTitle ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
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

      {/* Container Scrollable Cho Toolbar và Nội Dung */}
      <div
        className="h-[600px] overflow-y-auto editor-container"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 transparent',
        }}
      >
        {/* Thanh công cụ (Toolbar) */}
        <div className="sticky top-0 z-10 bg-white p-2 flex items-center space-x-2">
          {menuBar.map((item, index) => (
            <ToolbarButton
              key={index}
              icon={item.icon}
              onClick={item.action}
              isActive={item.isActive ? item.isActive() : false}
              tooltip={item.tooltip}
              disabled={!editor}
            >
              {item.children}
            </ToolbarButton>
          ))}
        </div>

        {/* Table of Contents (Mục Lục) */}
        {toc.length > 0 && (
          <div className="p-4 bg-blue-50">
            <h3 className="text-lg font-semibold mb-2">Mục Lục</h3>
            <ul className="list-disc list-inside space-y-1">
              {toc.map((heading, index) => (
                <li key={index} className={`ml-${heading.level * 2}`}>
                  <a href={`#${heading.id}`} className="text-blue-500 hover:underline">
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nội dung bài viết */}
        <div
          className="p-4 relative editor-content content"
        >
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            </div>
          )}
          {editor && (
            <>
              {isPreview ? (
                <div className="prose lg:prose-xl max-w-none mb-8">
                  <div
                    className="post-content content" // Thêm lớp .content
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              ) : (
                <>
                  <EditorContent editor={editor} className="min-h-[300px] focus:outline-none prose content" /> {/* Thêm lớp .content */}
                  {isContentEmpty && (
                    <p className="absolute text-gray-500 italic top-4 left-4 pointer-events-none">
                      Nội dung bài viết...
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export default PostForm;

