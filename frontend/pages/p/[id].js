// // pages/p/[id].js
// import { useRouter } from 'next/router';
// import React from 'react';
// import { usePost, usePostName } from '../../hooks/usePost';
// import PostDetail from '../../components/Post/PostDetail';

// const PostPage = () => {
//   const router = useRouter();
//   const { id } = router.query;

//   //const { post, isLoading, isError, mutate } = usePost(id);
//   const { post, isLoading, isError, mutate } = usePostName(id);

//   if (isLoading) return <div>Loading...</div>;
//   if (isError) return <div>Failed to load post.</div>;

//   return (
//     <div className="flex min-h-screen">
//       {/* Khoảng trống bên trái */}
//       <div className="hidden lg:block lg:w-2/12"></div>

//       {/* Nội dung chính */}
//       <main className="flex-1 p-6 overflow-auto">
//         <PostDetail post={post} />
//       </main>

//       {/* Khoảng trống bên phải */}
//       <div className="hidden lg:block lg:w-2/12"></div>
//     </div>
//   );
// };

// export default PostPage;


// pages/p/[id].js
import { useRouter } from 'next/router';
import React from 'react';
import { usePostName } from '../../hooks/usePost';
import PostDetail from '../../components/Post/PostDetail';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const { post, isLoading, isError, mutate } = usePostName(id);

  if (isLoading) return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse text-secondary">Loading post...</div>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="text-center">
        <div className="text-danger font-mono">Failed to load post</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <main className="overflow-hidden">
          <PostDetail post={post} />
        </main>
      </div>
    </div>
  );
};

export default PostPage;
