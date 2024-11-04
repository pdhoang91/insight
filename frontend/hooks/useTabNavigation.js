//hooks/useTabNavigation.js
import { useState } from 'react';

export const useTabNavigation = (initialTab = 'YourPosts') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const navigateToTab = (tabName) => {
    setActiveTab(tabName);
  };

  return { activeTab, navigateToTab };
};

export default useTabNavigation;

