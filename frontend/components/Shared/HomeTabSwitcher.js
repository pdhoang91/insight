// components/Shared/HomeTabSwitcher.js
import React, { useState, useEffect } from 'react';
import { useHomeTabSwitcher } from '../../hooks/useHomeTabSwitcher';
import { useUser } from '../../context/UserContext';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';

const HomeTabSwitcher = () => {
  const { activeTab, toggleTab } = useHomeTabSwitcher();
  const { user } = useUser();
  const [tabs, setTabs] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // Hàm lấy danh sách tab từ back-end
  const fetchTabs = async () => {
    try {
      //const response = await axios.get('/api/tabs');
      //setTabs(response.data.tabs);
      setTabs(["ForYou"]);
    } catch (error) {
      console.error('Error fetching tabs:', error);
    }
  };

  useEffect(() => {
    fetchTabs();
  }, []);

  // Hàm thêm tab mới
  const addTab = async () => {
    if (!newTabName.trim()) return;

    try {
      const response = await axios.post('/api/tabs', { name: newTabName });
      setTabs([...tabs, response.data.tab]);
      setNewTabName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding tab:', error);
    }
  };

  return (
    <div className="flex space-x-4 mb-6 pb-2 items-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => toggleTab(tab.name)}
          className={`text-lg pb-2 font-mono ${
            activeTab === tab.name ? 'border-b-2 border-green-400 text-green-400' : 'text-gray-400 hover:text-gray-200'
          } transition-colors duration-200`}
        >
          {tab.name}
        </button>
      ))}

      {/* Icon thêm tab mới */}
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="text-lg text-gray-400 hover:text-green-400 transition-colors duration-200"
      >
        <FaPlus />
      </button>

      {/* Form thêm tab mới */}
      {isAdding && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTabName}
            onChange={(e) => setNewTabName(e.target.value)}
            placeholder="new_tab"
            className="border border-gray-600 bg-gray-800 text-white rounded px-2 py-1 text-sm font-mono focus:border-green-400 focus:outline-none"
          />
          <button
            onClick={addTab}
            className="text-green-400 hover:text-green-300 font-mono text-sm"
          >
            add()
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewTabName('');
            }}
            className="text-red-400 hover:text-red-300 font-mono text-sm"
          >
            cancel()
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeTabSwitcher;
