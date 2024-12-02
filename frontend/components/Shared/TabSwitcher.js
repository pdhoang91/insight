// // components/Shared/TabSwitcher.js
// components/Shared/TabSwitcher.js
import React, { useEffect, useState, useRef } from 'react';
import { getUserTabs } from '../../services/tabService';
import { useRouter } from 'next/router';
import { IoIosAdd, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const TabSwitcher = ({ activeTab, toggleTab, user }) => {
  const [extraTabs, setExtraTabs] = useState([]);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  // Refs for the scrollable container
  const tabsContainerRef = useRef(null);

  // State to manage visibility of arrows
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchTabs = async () => {
        try {
          const tabs = await getUserTabs();
          setExtraTabs(tabs);
        } catch (error) {
          console.error("Error fetching tabs:", error);
          setIsError(true);
        }
      };

      fetchTabs();
    }
  }, [user]);

  useEffect(() => {
    const checkForOverflow = () => {
      const container = tabsContainerRef.current;
      if (container) {
        // Check if scroll is possible
        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(container.scrollWidth > container.clientWidth + container.scrollLeft);
      }
    };

    const container = tabsContainerRef.current;
    if (container) {
      // Initial check
      checkForOverflow();

      // Add event listener for scroll
      container.addEventListener('scroll', checkForOverflow);
      // Add event listener for window resize
      window.addEventListener('resize', checkForOverflow);

      // Cleanup
      return () => {
        container.removeEventListener('scroll', checkForOverflow);
        window.removeEventListener('resize', checkForOverflow);
      };
    }
  }, [extraTabs, activeTab, user]);

  const handleIconClick = () => {
    router.push('/explore');
  };

  const handleTabClick = (tabName) => {
    toggleTab(tabName);
  };

  const scrollTabs = (direction) => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 150; // Adjust scroll amount as needed
      const newScrollPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  if (isError) return <div className="text-center text-red-500">Error loading tabs.</div>;

  return (
    <div className="relative flex items-center mb-6 p-6 pb-2">
      {/* Nút mũi tên trái */}
      {showLeftArrow && (
        <button
          onClick={() => scrollTabs('left')}
          className="absolute left-0 items-center justify-center w-8 h-8 self-center transition-opacity duration-300"
        >
          <IoIosArrowBack size={20} className="-translate-y-1"/>
        </button>
      )}
      <div  className="overflow-x-auto ">

      {/* Container cuộn các tab */}
      <div
        ref={tabsContainerRef}
        className="flex custom-scrollbar items-center space-x-4 overflow-x-auto flex-nowrap ml-2 lg:ml-4 px-2"
      >
        {/* Nút thêm tab nếu có người dùng */}
      {user && (
        <button
          onClick={handleIconClick}
          className="flex-shrink-0 flex items-center justify-center text-gray-600 hover:text-gray-900 ml-8 lg:ml-0" // Adjust margin-left to avoid overlapping with left arrow
        >
          <IoIosAdd size={24} />
        </button>
      )}
        {/* Các Tab */}
        <button
          onClick={() => handleTabClick('ForYou')}
          className={`text-lg pb-2 whitespace-nowrap ${
            activeTab === 'ForYou' ? 'border-b-2 border-gray-200 text-black' : 'text-gray-600'
          } transition-colors duration-200`}
          key="ForYou"
        >
          For You
        </button>

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
            key={tab.id || tab.name || `tab-${Math.random()}`}
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


      {/* Nút mũi tên phải */}
      {showRightArrow && (
        <button
          onClick={() => scrollTabs('right')}
          className="absolute right-0 items-center justify-center w-8 h-8 self-center transition-opacity duration-300"
        >
          <IoIosArrowForward size={20} className="-translate-y-1" />
        </button>
      )}
    </div>
  );
};

export default TabSwitcher;
