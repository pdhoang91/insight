// pages/edit-post/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import PostForm from '../../components/Post/PostForm';
import { getPostById, updatePost } from '../../services/postService';

const EditPost = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (id) {
      getPostById(id)
        .then((postData) => {
          setPost(postData);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [id]);

  const handleUpdate = async (title, content, categories, tags) => {
    try {
      await updatePost(id, {
        title,
        content,
        categories,
        tags,
      });
      router.push(`/post/${id}`);
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      <PostForm
        title={post.title}
        setTitle={(value) => setPost({ ...post, title: value })}
        content={post.content}
        setContent={(value) => setPost({ ...post, content: value })}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default EditPost;
