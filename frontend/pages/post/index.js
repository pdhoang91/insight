// pages/post/index.js
import PostList from '../../components/Post/PostList';
import Sidebar from '../../components/Shared/Sidebar';
import SearchBar from '../../components/Utils/SearchBar';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();
  const { search } = router.query;

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-3/4 p-4">
        <SearchBar />
        <PostList searchQuery={search} />
      </div>
    </div>
  );
};

export default Home;
