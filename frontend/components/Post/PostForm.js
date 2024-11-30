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

// const FloatingMenu = ({ editor, position, isVisible }) => {
//   if (!isVisible || !position || !editor) return null;

//   return (
//     <div
//       className="fixed z-50 bg-white shadow-lg rounded-lg border border-gray-200 flex items-center space-x-1 p-1 transition-opacity duration-200"
//       style={{
//         top: `${position.top}px`,
//         left: `${position.left}px`,
//         transform: 'translate(-50%, -100%)',
//         opacity: isVisible ? 1 : 0,
//       }}
//     >
//       <ToolbarButton
//         icon={FaBold}
//         onClick={() => editor.chain().focus().toggleBold().run()}
//         isActive={editor.isActive('bold')}
//         tooltip="Đậm"
//       />
//       <ToolbarButton
//         icon={FaItalic}
//         onClick={() => editor.chain().focus().toggleItalic().run()}
//         isActive={editor.isActive('italic')}
//         tooltip="Nghiêng"
//       />
//       <ToolbarButton
//         icon={FaUnderline}
//         onClick={() => editor.chain().focus().toggleUnderline().run()}
//         isActive={editor.isActive('underline')}
//         tooltip="Gạch chân"
//       />
//       <ToolbarButton
//         icon={FaStrikethrough}
//         onClick={() => editor.chain().focus().toggleStrike().run()}
//         isActive={editor.isActive('strike')}
//         tooltip="Gạch ngang"
//       />
//       <ToolbarButton
//         icon={FaQuoteRight}
//         onClick={() => editor.chain().focus().toggleBlockquote().run()}
//         isActive={editor.isActive('blockquote')}
//         tooltip="Trích dẫn"
//       />
//       <ToolbarButton
//         icon={FaLink}
//         onClick={() => {
//           const url = prompt('Nhập URL');
//           if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
//         }}
//         isActive={editor.isActive('link')}
//         tooltip="Chèn liên kết"
//       />
//     </div>
//   );
// };

// const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle }) => {
//   const [isUploading, setIsUploading] = useState(false);
//   const [isUploadingTitle, setIsUploadingTitle] = useState(false);
//   const [isContentEmpty, setIsContentEmpty] = useState(!content || content.trim() === '');
//   const [isPreview, setIsPreview] = useState(false);
//   const [menuPosition, setMenuPosition] = useState(null);
//   const [isMenuVisible, setIsMenuVisible] = useState(false);

//   // Định nghĩa handleSelectionUpdate trước khi sử dụng nó
//   const handleSelectionUpdate = useCallback(() => {
//     if (!editor || isPreview) {
//       setIsMenuVisible(false);
//       return;
//     }

//     const { state } = editor;
//     const { empty, from, to } = state.selection;

//     if (empty) {
//       setIsMenuVisible(false);
//       return;
//     }

//     // Lấy tọa độ của lựa chọn
//     const view = editor.view;
//     const { top, left, right } = view.coordsAtPos(from);
//     const editorEl = view.dom.getBoundingClientRect();

//     setMenuPosition({
//       top: top + window.scrollY,
//       left: left + (right - left) / 2,
//     });
//     setIsMenuVisible(true);
//   }, [isPreview]);

//   // Khởi tạo editor sau khi handleSelectionUpdate đã được định nghĩa
//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       TextStyle,
//       Underline,
//       Link.configure({ openOnClick: false }),
//       Image,
//     ],
//     content: content || '',
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       setContent(html);
//       setIsContentEmpty(html.trim() === '');
//     },
//     // Loại bỏ onSelectionUpdate khỏi cấu hình
//   });

//   // Đăng ký sự kiện 'selectionUpdate' sau khi editor đã được khởi tạo
//   useEffect(() => {
//     if (editor) {
//       editor.on('selectionUpdate', handleSelectionUpdate);
//       return () => {
//         editor.off('selectionUpdate', handleSelectionUpdate);
//       };
//     }
//   }, [editor, handleSelectionUpdate]);

//   // Đồng bộ nội dung khi `content` thay đổi từ bên ngoài
//   useEffect(() => {
//     if (editor) {
//       const currentContent = editor.getHTML();
//       if (content !== currentContent) {
//         editor.commands.setContent(content || '');
//         setIsContentEmpty(!content || content.trim() === '');
//       }
//     }
//   }, [content, editor]);

//   // Đóng menu khi click ra ngoài trình soạn thảo
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (editor && !editor.view.dom.contains(event.target)) {
//         setIsMenuVisible(false);
//       }
//     };

//     document.addEventListener('mouseup', handleClickOutside);
//     return () => {
//       document.removeEventListener('mouseup', handleClickOutside);
//     };
//   }, [editor]);

//   const handleImageUpload = () => {
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
//   };

//   const handleImageTitleUpload = () => {
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
//   };

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
//   }, [editor, isPreview]);

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

//     // Xử lý logic gửi dữ liệu ở đây
//     console.log('Đăng bài viết:', postData);
//     // Ví dụ: Gửi dữ liệu lên API
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
//         {editor ? (
//           <>
//             <FloatingMenu
//               editor={editor}
//               position={menuPosition}
//               isVisible={isMenuVisible}
//             />
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
//         ) : (
//           <p className="text-gray-400">Loading editor...</p>
//         )}
//       </div>
//     </form>
//   );
// };

// export default PostForm;

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
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
} from 'react-icons/fa';

const ToolbarButton = ({ icon: Icon, onClick, isActive, tooltip, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded hover:bg-blue-100 focus:outline-none ${
      isActive ? 'bg-blue-500 text-white' : 'text-gray-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-label={tooltip}
    title={tooltip}
  >
    <Icon />
  </button>
);

const FloatingMenu = ({ editor, position, isVisible }) => {
  if (!isVisible || !position || !editor) return null;

  return (
    <div
      className="fixed z-50 bg-white shadow-lg rounded-lg border border-gray-200 flex items-center space-x-1 p-1 transition-all duration-200"
      style={{
        top: `${position.top + 275}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      <ToolbarButton
        icon={FaBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        tooltip="Đậm"
      />
      <ToolbarButton
        icon={FaItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        tooltip="Nghiêng"
      />
      <ToolbarButton
        icon={FaUnderline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        tooltip="Gạch chân"
      />
      <ToolbarButton
        icon={FaStrikethrough}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        tooltip="Gạch ngang"
      />
    </div>
  );
};

const PostForm = ({ title, setTitle, content, setContent, imageTitle, setImageTitle }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingTitle, setIsUploadingTitle] = useState(false);
  const [isContentEmpty, setIsContentEmpty] = useState(!content || content.trim() === '');
  const [isPreview, setIsPreview] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setIsContentEmpty(html.trim() === '');
    },
  });
  const updateMenuPosition = useCallback(() => {
    if (!editor || isPreview) {
      setIsMenuVisible(false);
      return;
    }
  
    const { state } = editor;
    const { empty, from, to } = state.selection;
  
    if (empty) {
      setIsMenuVisible(false);
      return;
    }
  
    const view = editor.view;
    
    // Get coordinates for both the start and end of selection
    const startPos = view.coordsAtPos(from);
    const endPos = view.coordsAtPos(to);
    const editorRect = view.dom.getBoundingClientRect();
  
    // Calculate the midpoint of selection
    const selectionMidX = (startPos.left + endPos.left) / 2;
    
    // Use the topmost position for the menu
    const menuTop = Math.min(startPos.top, endPos.top);
  
    // Position relative to the editor
    setMenuPosition({
      top: menuTop - editorRect.top + window.scrollY - 10, // Add small offset for visual spacing
      left: selectionMidX,
    });
    
    // Ensure menu stays visible
    setTimeout(() => {
      setIsMenuVisible(true);
    }, 0);
  }, [editor, isPreview]);
  
  // Add mouse event handlers
  useEffect(() => {
    if (!editor) return;
  
    const handleMouseUp = () => {
      if (!editor.state.selection.empty) {
        updateMenuPosition();
      }
    };
  
    const editorElement = editor.view.dom;
    editorElement.addEventListener('mouseup', handleMouseUp);
  
    return () => {
      editorElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor, updateMenuPosition]);

  useEffect(() => {
    if (editor) {
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content || '');
        setIsContentEmpty(!content || content.trim() === '');
      }
    }
  }, [content, editor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editor && !editor.view.dom.contains(event.target)) {
        setIsMenuVisible(false);
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [editor]);

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
  }, [editor, isPreview, handleImageUpload]);

  const handleSubmit = (e) => {
    e.preventDefault();
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
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 relative">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full pr-10 p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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

      <div className="mb-4">
        <div className="flex items-center justify-center space-x-2 p-2">
          {menuBar.map((item, index) => (
            <ToolbarButton
              key={index}
              icon={item.icon}
              onClick={item.action}
              isActive={item.isActive ? item.isActive() : false}
              tooltip={item.tooltip}
              disabled={!editor}
            />
          ))}
        </div>
      </div>

      <div className="mb-4 p-4 min-h-[300px] relative">
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
            <FloatingMenu
              editor={editor}
              position={menuPosition}
              isVisible={isMenuVisible}
            />
            {isPreview ? (
              <div className="prose lg:prose-xl max-w-none mb-8">
                <div
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            ) : (
              <>
                <EditorContent editor={editor} />
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
    </form>
  );
};

export default PostForm;