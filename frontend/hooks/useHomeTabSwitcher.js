// hooks/useHomeTabSwitcher.js
import { useState } from 'react';

export const useHomeTabSwitcher = () => {
  const [activeTab, setActiveTab] = useState('ForYou');

  const toggleTab = (tabName) => {
    setActiveTab(tabName);
  };

  return { activeTab, toggleTab };
};
