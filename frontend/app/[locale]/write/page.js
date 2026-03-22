'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../context/UserContext';
import { createPost } from '../../../services/postService';
import PostEditorPage from '../../../components/Editor/PostEditorPage';

export default function WritePage() {
  const router = useRouter();
  const { user } = useUser();

  const handleCreate = useCallback(async (selectedCategories, tags, { title, content, imageTitle }) => {
    try {
      const res = await createPost({
        title,
        content,
        cover_image: imageTitle,
        categories: selectedCategories.map(cat => cat.name),
        tags,
      });
      router.push(`/p/${res.data.slug}`);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Không thể tạo bài viết.');
    }
  }, [router]);

  return (
    <PostEditorPage
      mode="create"
      onSave={handleCreate}
    />
  );
}
