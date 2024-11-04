
// components/Search/SearchTabs.js
import React, { useState } from 'react';
import { StoriesTab } from './Tabs/StoriesTab';
import { PeopleTab } from './Tabs/PeopleTab';

export const SearchTabs = ({ query, data }) => {
  const tabs = ['Stories', 'People'];
  const [activeTab, setActiveTab] = useState('Stories');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Stories':
        return <StoriesTab stories={data.stories} query={query} />;
      case 'People':
        return <PeopleTab peoples={data.people} query={query} />; // Sửa lại thành "peoples"
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-semibold ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600 hover:text-blue-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};
export default SearchTabs;


