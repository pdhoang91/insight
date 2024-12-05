import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import CategoryTagsPopup from '../components/Category/CategoryTagsPopup';
import PostForm from '../components/Editor/PostForm';
import { createPost } from '../services/postService';
import { usePostContext } from '../context/PostContext';
import { FaRobot } from 'react-icons/fa';

const Write = () => {
  const router = useRouter();
  const { user, setModalOpen, loading } = useUser();
  const { setHandlePublish, setHandleUpdate } = usePostContext();

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
      router.push(`/p/${res.data.title_name}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post.');
    }
  }, [user, title, content, imageTitle, router]);

  useEffect(() => {
    setHandlePublish(() => publishFunction);
    setHandleUpdate(null);
    return () => {
      setHandlePublish(null);
    };
  }, [publishFunction, setHandlePublish, setHandleUpdate]);

  if (loading) {
    return <div className="container mx-auto">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-white-7000">
      <div className="w-full max-w p-6 bg-white">
        <div className="flex justify-between items-center gap-4 mb-4">
          <Link href="/aiwrite" className="text-gray-500 hover:text-gray-700" title="Hỗ trợ viết bằng AI">
              <FaRobot size={24} />
          </Link>
        </div>
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
