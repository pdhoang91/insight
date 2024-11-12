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

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (isError) return <div className="flex justify-center items-center h-screen">Failed to load post.</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar bên trái */}
      <aside className="hidden lg:block lg:w-2/12 p-4">
        {/* Nội dung sidebar bên trái */}
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-4">
        <PostDetail post={post} />
      </main>

      {/* Sidebar bên phải */}
      <aside className="hidden lg:block lg:w-2/12 p-4">
        {/* Nội dung sidebar bên phải */}
      </aside>
    </div>
  );
};

export default PostPage;
