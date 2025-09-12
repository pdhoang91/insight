import React from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import PostItemSmall from './PostItemSmall';
import { getPopulerPosts } from '../../services/postService';
import { useUser } from '../../context/UserContext';

const fetchPopulerPost = async () => {
  // Adjust parameters as needed
  const data = await getPopulerPosts(1, 3);
  console.log("datatest", data);
  return data;
};

const RecommendedPost = () => {
  const { data, error } = useSWR('/posts/populer', fetchPopulerPost);

  // Thêm kiểm tra nếu `data` hoặc `data.posts` là `undefined`
  if (error) {
    return <div>Không thể tải bài viết phổ biến.</div>;
  }

  if (!data) {
    return <div>Đang tải...</div>;
  }

  const { posts, totalCount } = data;

  return (
    <div>
      {posts.map((post) => (
        <PostItemSmall key={post.id} post={post} />
      ))}
    </div>
  );
};

export default RecommendedPost;