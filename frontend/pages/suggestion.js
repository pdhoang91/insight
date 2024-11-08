//pages/suggestion.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import Sidebar from '../components/Shared/Sidebar';
import SidebarRight from '../components/Shared/SidebarRight';
import FollowList from '../components/Following/FollowList';
import { useTabSwitcher } from '../hooks/useTabSwitcher';
import { getUserTabs } from '../services/tabService'; // Endpoint mới để lấy tabs người dùng đang theo dõi (categories)
import { getAvailableWriters, getAvailableTopics } from '../services/followService';
import AuthorInfo from '../components/Auth/AuthorInfo';
const Suggestion = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTabs, setUserTabs] = useState([]);
  const [availableWriters, setAvailableWriters] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);

  // Sử dụng useTabSwitcher để quản lý trạng thái tab
  const { activeTab, toggleTab } = useTabSwitcher('Suggestions'); // 'Topics' là tab mặc định

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi các API đồng thời
        const [tabs, writers, topics] = await Promise.all([
          
          getUserTabs(),
          getAvailableWriters(),
          getAvailableTopics(),
        ]);

        setUserTabs(tabs);

        // Cập nhật writers với trạng thái isFollowing
        const updatedWriters = writers.map((writer) => ({
          ...writer,
          isFollowing: false, // Giữ nguyên logic xử lý theo dõi writers
        }));
        setAvailableWriters(updatedWriters);

        // Cập nhật topics với trạng thái isFollowing
        const updatedTopics = topics.map((topic) => ({
          ...topic,
          isFollowing: tabs.some(
            (tab) => tab.name === topic.name // Dựa trên name để xác định
          ),
        }));
        setAvailableTopics(updatedTopics);

        setLoading(false);
      } catch (err) {
        setError('Failed to load following data.');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCategoryFollowChange = (updatedItem) => {
    if (activeTab !== 'Suggestions') return; // Chỉ xử lý nếu đang ở tab 'Topics'

    setAvailableTopics((prevTopics) =>
      prevTopics.map((topic) =>
        topic.id === updatedItem.id ? updatedItem : topic
      )
    );

    // Cập nhật userTabs
    setUserTabs((prevTabs) => {
      const existingTabIndex = prevTabs.findIndex(
        (tab) => tab.category_id === updatedItem.id
      );

      if (updatedItem.isFollowing) {
        // Thêm tab mới
        if (existingTabIndex === -1) {
          return [
            ...prevTabs,
            {
              category_id: updatedItem.id,
              name: updatedItem.name,
              description: updatedItem.description,
            },
          ];
        }
      } else {
        // Xóa tab
        if (existingTabIndex !== -1) {
          const newTabs = [...prevTabs];
          newTabs.splice(existingTabIndex, 1);
          return newTabs;
        }
      }
      return prevTabs;
    });
  };

  const handleWriterFollowChange = (updatedWriter) => {
    if (activeTab !== 'Writers') return; // Chỉ xử lý nếu đang ở tab 'Writers'

    setAvailableWriters((prevWriters) =>
      prevWriters.map((writer) =>
        writer.id === updatedWriter.id ? updatedWriter : writer
      )
    );
    // Thêm logic cập nhật userTabs nếu cần thiết
  };

  if (loading) return <div>Loading following...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar Left */}
      <aside className="lg:w-1/12 p-4 sticky top-4 h-fit">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="lg:w-8/12 p-4">
        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-6 pb-2">
          <button
            onClick={() => toggleTab('Suggestions')}
            className={`text-lg pb-2 ${
              activeTab === 'Suggestions' ? 'border-b-2 border-gray-200' : 'text-gray-600'
            } transition-colors duration-200`}
          >
            Suggestions
          </button>
          {user && (
            <button
              onClick={() => toggleTab('Following')}
              className={`text-lg pb-2 ${
                activeTab === 'Following' ? 'border-b-2 border-gray-200' : 'text-gray-600'
              } transition-colors duration-200`}
            >
              Following
            </button>
          )}
        </div>

        {/* Hiển thị nội dung dựa trên activeTab */}
        {activeTab === 'Suggestions' && (
          <FollowList
            category="Suggestions to follow"
            initialItems={availableTopics}
            onFollowChange={handleCategoryFollowChange}
          />
        )}
       {activeTab === 'Following' && (
          <div>
            {availableWriters.map((person) => (
              <div key={person.user_id} className="mb-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <AuthorInfo author={{ 
                  id: person.user_id, 
                  username: person.username, 
                  name: person.name, 
                  avatar_url: person.avatar_url
                }} />
                <p className="text-gray-600">{person.email}</p>
                <p className="text-gray-600">{person.phone}</p>
              </div>
            ))}
          </div>
        )}
        {/* Thêm các tab khác nếu cần */}
      </main>

      {/* Sidebar Right */}
      <aside className="lg:w-3/12 p-4 sticky top-4 h-fit">
        <SidebarRight />
      </aside>
    </div>
  );
};

export default Suggestion;



