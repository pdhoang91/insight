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
          className={`text-lg pb-2 ${
            activeTab === tab.name ? 'border-b-2 border-gray-200' : 'text-gray-600'
          } transition-colors duration-200`}
        >
          {tab.name}
        </button>
      ))}

      {/* Icon thêm tab mới */}
      <button
        onClick={() => setIsAdding(!isAdding)}
        className="text-lg text-gray-600 hover:text-gray-800 transition-colors duration-200"
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
            placeholder="Tên tab mới"
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={addTab}
            className="text-green-500 hover:text-green-700"
          >
            Thêm
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewTabName('');
            }}
            className="text-red-500 hover:text-red-700"
          >
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeTabSwitcher;
