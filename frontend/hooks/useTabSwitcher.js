// hooks/useTabSwitcher.js
import { useState } from 'react';

export const useTabSwitcher = (initialTab = 'ForYou') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const toggleTab = (tab) => {
    setActiveTab(tab);
  };

  return { activeTab, toggleTab };
};
