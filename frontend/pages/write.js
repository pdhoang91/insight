// pages/write.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import CategoryTagsPopup from '../components/Category/CategoryTagsPopup';
import PostForm from '../components/Post/PostForm';
import { createPost } from '../services/postService';
import { usePostContext } from '../context/PostContext'; // Import hook

const Write = () => {
  const router = useRouter();
  const { user, setModalOpen, loading } = useUser();
  const { setHandlePublish, setHandleUpdate } = usePostContext(); // Sử dụng setter từ Context

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageTitle, setImageTitle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [loading, user, setModalOpen]);

  useEffect(() => {
    if (router.asPath.includes('#submit')) {
      setShowPopup(true);
      router.replace('/write', undefined, { shallow: true });
    }
  }, [router.asPath, router]);

  const publishFunction = useCallback(async (categories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }
    try {
      const res = await createPost({
        title,
        content,
        image_title: imageTitle,
        author_id: user.id,
        author: user.name,
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      });
      //alert('Bài viết đã được tạo thành công!');
      router.push(`/p/${res.data.title_name}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post.');
    }
  }, [user, title, content, imageTitle, router]);

  // Thiết lập handlePublish trong Context khi trang mount
  useEffect(() => {
    setHandlePublish(() => publishFunction);
    setHandleUpdate(null); // Đảm bảo handleUpdate không được thiết lập trên trang write
    return () => {
      setHandlePublish(null);
    };
  }, [publishFunction, setHandlePublish, setHandleUpdate]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-white-7000">
      <div className="w-full max-w p-6 bg-white">
        <PostForm
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          imageTitle={imageTitle}
          setImageTitle={setImageTitle}
        />

        {showPopup && (
          <CategoryTagsPopup
            title={title}
            content={content}
            imageTitle={imageTitle}
            onPublish={publishFunction}
            onCancel={() => setShowPopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Write;
