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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 font-mono p-8 max-w-md w-full text-center">
        <div className="animate-pulse">Loading post...</div>
      </div>
    </div>
  );
  
  if (isError) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white text-red-600 font-mono p-8 max-w-md w-full text-center">
        // Failed to load post
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Technical Terminal-style Layout */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Content Area - White on Black */}
        <main className="bg-white text-gray-900 min-h-[80vh]">
          <PostDetail post={post} />
        </main>
      </div>
    </div>
  );
};

export default PostPage;
