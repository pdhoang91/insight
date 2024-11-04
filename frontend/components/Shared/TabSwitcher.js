// components/Shared/TabSwitcher.js
import React, { useEffect, useState } from 'react';
import { getTabs, getUserTabs } from '../../services/tabService';
import { useRouter } from 'next/router'; // Nếu bạn dùng Next.js
import { IoIosAdd } from "react-icons/io";

const TabSwitcher = ({ activeTab, toggleTab, user }) => {
  const [extraTabs, setExtraTabs] = useState([]);
  const [isError, setIsError] = useState(false);
  const router = useRouter(); // Nếu dùng Next.js

  useEffect(() => {

    if (user) {
      console.log("useruser", user)
      const fetchTabs = async () => {
        try {
          //const tabs = await getTabs();
          const tabs = await getUserTabs();
          console.log("tabs", tabs);
          setExtraTabs(tabs);
        } catch (error) {
          setIsError(true);
        }
      };
  
      fetchTabs();
    }
  }, []);

  const handleIconClick = () => {
    router.push('/suggestion');
  };

  const handleTabClick = (tabName) => {
    toggleTab(tabName);
  };

  if (isError) return <div className="text-center text-red-500">Error loading tabs.</div>;

  return (
    <div className="flex items-center space-x-4 mb-6 pb-2 overflow-x-auto">
      {/* Nút thêm tab nếu có người dùng */}
      {user && (
        <button onClick={handleIconClick} className="flex-shrink-0 text-gray-600 hover:text-gray-900">
          <IoIosAdd size={24} />
        </button>
      )}

      {/* Danh sách Tabs */}
      <div className="flex space-x-4">
        {/* Tab "For You" */}
        <button
          onClick={() => handleTabClick('ForYou')}
          className={`text-lg pb-2 whitespace-nowrap ${
            activeTab === 'ForYou' ? 'border-b-2 border-gray-200 text-black' : 'text-gray-600'
          } transition-colors duration-200`}
          key="ForYou"
        >
          For You
        </button>

        {/* Tab "Following" */}
        {user && (
          <button
            onClick={() => handleTabClick('Following')}
            className={`text-lg pb-2 whitespace-nowrap ${
              activeTab === 'Following' ? 'border-b-2 border-gray-200 text-black' : 'text-gray-600'
            } transition-colors duration-200`}
            key="Following"
          >
            Following
          </button>
        )}

        {/* Các Tab bổ sung từ backend */}
        {extraTabs.map((tab) => (
          <button
            key={tab.id || tab.name || `tab-${Math.random()}`} // Sử dụng tab.id nếu có, nếu không thì tab.name hoặc key tạm thời
            onClick={() => handleTabClick(tab.name)}
            className={`text-lg pb-2 whitespace-nowrap ${
              activeTab === tab.name ? 'border-b-2 border-gray-200 text-black' : 'text-gray-600'
            } transition-colors duration-200`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSwitcher;
