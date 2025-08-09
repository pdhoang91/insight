// components/Profile/UserPostItem.js
import Link from 'next/link';
import TextUtils from '../Utils/TextUtils';
import AuthorInfo from '../Auth/AuthorInfo';

const UserPostItem = ({ post }) => {
  if (!post) {
    return <div>Đang tải bài viết...</div>;
  }
  return (
    <div className=" flex flex-col md:flex-row border-b">
       <div className="md:w-2/3 pr-4">
       <AuthorInfo author={post.user} />
      <Link href={`/p/${post.title_name}`} className="text-2xl font-semibold text-gray-800 hover:underline">
        {post.title}
      </Link>
      <p className="text-gray-600 mt-2">
        <TextUtils html={post.preview_content} maxLength={200} />
      </p>
      </div>
       <div className="md:w-1/3 mt-4 md:mt-0">
          {post.image_title && (
            <Link href={`/p/${post.title_name}`}>
              <img
                src={post.image_title}
                alt={post.title}
                className="h-48 w-full object-cover rounded transform hover:scale-105 transition-transform duration-300"
              />
            </Link>
          )}
        </div>
       
    </div>
  );
};

export default UserPostItem;
