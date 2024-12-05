// components/Shared/WritePublishButton.js
import { useRouter } from 'next/router';
import { useUser } from '../../context/UserContext';
import { usePostContext } from '../../context/PostContext';

const WritePublishButton = ({ onAction }) => {
  const { user, loading, setModalOpen } = useUser();
  const { handlePublish, handleUpdate } = usePostContext();
  const router = useRouter();

  const isCreatePostPage = router.pathname === '/write';
  const isEditPostPage = router.pathname.startsWith('/edit/');

  const handleClick = () => {
    if (loading) return;
    if (user) {
      if (isCreatePostPage || isEditPostPage) {
        if (handlePublish) {
          router.push('/write#submit');
        } else if (handleUpdate) {
          const { id } = router.query;
          if (id) {
            router.push(`/edit/${id}#submit`);
          } else {
            alert('Không tìm thấy ID bài viết để cập nhật.');
          }
        } else {
          alert('Không thể gửi bài viết từ trang này.');
        }
      } else {
        router.push('/write');
      }
    } else {
      setModalOpen(true);
    }
    if (onAction) onAction(); // Đóng menu di động nếu cần
  };

  return (
    <span
      onClick={handleClick}
      className={`px-2 py-2 rounded-full hover:bg-${isCreatePostPage || isEditPostPage ? 'blue' : 'green'}-600 transition-colors cursor-pointer ${
        isCreatePostPage || isEditPostPage ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
      }`}
    >
      {isCreatePostPage || isEditPostPage ? 'Publish' : 'Write'}
    </span>
  );
};

export default WritePublishButton;
