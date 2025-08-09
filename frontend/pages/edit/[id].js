// pages/edit/[id].js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../../context/UserContext';
import CategoryTagsPopup from '../../components/Category/CategoryTagsPopup';
import PostForm from '../../components/Editor/PostForm';
import { updatePost } from '../../services/postService';
import { usePostName } from '../../hooks/usePost';
import { usePostContext } from '../../context/PostContext';

const EditPost = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, setModalOpen, loading } = useUser();
  const { setHandleUpdate, setHandlePublish } = usePostContext();

  const { post, isLoading, isError } = usePostName(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageTitle, setImageTitle] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const isInitialLoad = useRef(true); // Thêm useRef để theo dõi lần tải đầu tiên

  useEffect(() => {
    if (!loading && !user) {
      setModalOpen(true);
    }
  }, [loading, user, setModalOpen]);

  useEffect(() => {
    if (post && isInitialLoad.current) { // Chỉ đặt lại trạng thái lần đầu tiên
      setTitle(post.title || '');
      setContent(post.content || '');
      setImageTitle(post.image_title || null);
      isInitialLoad.current = false; // Đánh dấu đã tải xong
    }
  }, [post]);

  const updateFunction = useCallback(async (categories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }

    try {
      const res = await updatePost(id, {
        id:post.id, // Sử dụng id thay vì post.id
        title,
        content,
        image_title: imageTitle,
        categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      });
      //alert('Bài viết đã được cập nhật thành công!');
      router.push(`/p/${res.data.title_name}`);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post.');
    }
  }, [user, title, content, imageTitle, id, router]);

  // Thiết lập handleUpdate trong Context khi trang mount
  useEffect(() => {
    setHandleUpdate(() => updateFunction);
    setHandlePublish(null); // Đảm bảo handlePublish không được thiết lập trên trang edit
    return () => {
      setHandleUpdate(null);
    };
  }, [updateFunction, setHandleUpdate, setHandlePublish]);

  useEffect(() => {
    if (router.asPath.includes('#submit')) {
      setShowPopup(true);
      router.replace(`/edit/${id}`, undefined, { shallow: true });
    }
  }, [router.asPath, router, id]);

  if (!router.isReady || isLoading) return (
    <div className="loading-container">
      <div className="loading-card">Loading editor...</div>
    </div>
  );
  if (isError) return (
    <div className="loading-container">
      <div className="error-card">Failed to load post</div>
    </div>
  );
  if (!user) return null;

  return (
          <div className="page-container flex justify-center items-start">
      <div className="w-full max-w p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
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
            onPublish={updateFunction}
            onCancel={() => setShowPopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EditPost;
