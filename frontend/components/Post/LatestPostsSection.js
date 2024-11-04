// // export default LatestPostsSection;
// import React from 'react';
// import { useLatestPosts } from '../../hooks/useLatestPosts';
// import PostItemSmall from './PostItemSmall';

// const LatestPostsSection = () => {
//   const { latestPosts, isLoading, isError } = useLatestPosts();

//   if (isError) return <div>Failed to load latest posts</div>;
//   if (isLoading) return <div>Loading...</div>;

//   if (latestPosts.length === 0) {
//     return <div>No latest posts available.</div>;
//   }

//   return (
//     <div className="mb-6">
//       <h2 className="text-xl font-semibold mb-2">Latest Posts</h2>
//       {latestPosts.map(post => (
//         <PostItemSmall key={post.id} post={post} />
//       ))}
//     </div>
//   );
// };

// export default LatestPostsSection;
