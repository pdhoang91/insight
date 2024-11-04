// // components/Profile/UserPostList.js
// components/Profile/UserPostList.js
import UserPostItem from './UserPostItem';

const UserPostList = ({ posts = [] }) => {
  if (posts.length === 0) {
    return <div>No posts available.</div>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <UserPostItem key={post.id} post={post} />
      ))}
    </div>
  );
};

export default UserPostList;
