// pages/write.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import CategoryTagsPopup from '../components/Category/CategoryTagsPopup';
import PostForm from '../components/Post/PostForm';
import { createPost } from '../services/postService';

const Write = () => {
  const router = useRouter();
  const { user, setModalOpen, loading } = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageTitle, setImageTitle] = useState(null); // Thêm state cho imageTitle
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

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (!user) {
  //     setModalOpen(true);
  //     return;
  //   }
  //   setShowPopup(true);
  // };

  const handlePublish = async (categories, tags) => {
    if (!user) {
      setModalOpen(true);
      return;
    }
    try {
      const res = await createPost({
        title,
        content,
        image_title: imageTitle, // Bao gồm imageTitle trong dữ liệu gửi lên server
        author_id: user.id,
        author: user.name,
        categories: categories
          ? categories.split(',').map((cat) => cat.trim())
          : [],
        tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
      });
      router.push(`/p/${res.data.title_name}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post.');
    }
  };

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
          imageTitle={imageTitle} // Truyền imageTitle
          setImageTitle={setImageTitle} // Truyền setImageTitle
        />

        {showPopup && (
          <CategoryTagsPopup
            title={title}
            content={content}
            imageTitle={imageTitle} // Truyền imageTitle để hiển thị trong preview
            onPublish={handlePublish}
            onCancel={() => setShowPopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Write;


