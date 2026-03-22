'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useUser } from '../../../../context/UserContext';
import { updatePost } from '../../../../services/postService';
import { usePostName } from '../../../../hooks/usePost';
import { isSuperAdmin } from '../../../../services/authService';
import PostEditorPage from '../../../../components/Editor/PostEditorPage';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user } = useUser();
  const { post, isLoading, isError } = usePostName(id);
  const [initialized, setInitialized] = useState(false);
  const [initialTitle, setInitialTitle] = useState('');
  const [initialContent, setInitialContent] = useState(null);
  const [initialImage, setInitialImage] = useState(null);

  useEffect(() => {
    if (post && !initialized) {
      setInitialTitle(post.title || '');
      setInitialContent(post.content || null);
      setInitialImage(post.cover_image || null);
      setInitialized(true);
    }
  }, [post, initialized]);

  const handleUpdate = useCallback(async (selectedCategories, tags, { title, content, imageTitle }) => {
    try {
      const res = await updatePost(post.id, {
        title,
        content,
        cover_image: imageTitle,
        categories: selectedCategories.map(cat => cat.name),
        tags,
      });
      router.push(`/p/${res.data.slug}`);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Không thể cập nhật bài viết.');
    }
  }, [post?.id, router]);

  // Permission check
  const noPermission = post && user && post.user?.id !== user.id && !isSuperAdmin();
  const errorMessage = noPermission
    ? 'Bạn không phải là tác giả của bài viết này.'
    : 'Không thể tìm thấy bài viết bạn muốn chỉnh sửa.';

  return (
    <PostEditorPage
      mode="edit"
      initialTitle={initialTitle}
      initialContent={initialContent}
      initialImage={initialImage}
      initialCategories={post?.categories || []}
      initialTags={post?.tags?.map(t => t.name) || []}
      onSave={handleUpdate}
      isLoadingData={isLoading || !initialized}
      isErrorData={isError || noPermission}
      errorMessage={errorMessage}
    />
  );
}
