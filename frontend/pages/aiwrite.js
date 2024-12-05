import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import CategoryTagsPopup from '../components/Category/CategoryTagsPopup';
import { createPost } from '../services/postService';
import { usePostContext } from '../context/PostContext'; // Import hook
import ArticleSummarizer from '../components/Editor/AIWrite/ArticleSummarizer';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '1200px',
    padding: '1.5rem',
  },
  columns: {
    display: 'flex',
    flexDirection: 'row',
    gap: '1.5rem',
  },
  column: {
    flex: 1,
  },
};

const AIWrite = () => {
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

  const publishFunction = useCallback(
    async (categories, tags) => {
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
          categories: categories ? categories.split(',').map((cat) => cat.trim()) : [],
          tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
        });
        router.push(`/p/${res.data.title_name}`);
      } catch (error) {
        console.error('Failed to create post:', error);
        alert('Failed to create post.');
      }
    },
    [user, title, content, imageTitle, router]
  );

  useEffect(() => {
    setHandlePublish(() => publishFunction);
    setHandleUpdate(null);
    return () => {
      setHandlePublish(null);
    };
  }, [publishFunction, setHandlePublish, setHandleUpdate]);

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.columns}>
          {/* <div style={styles.column}>
            <PostForm
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              imageTitle={imageTitle}
              setImageTitle={setImageTitle}
            />
          </div> */}
          <div style={styles.column}>
            <ArticleSummarizer />
          </div>
        </div>

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

export default AIWrite;
