// components/Search/Tabs/PeopleTab.js
import React from 'react';
import FollowListItem from '../../Explore/FollowListItem';

export const PeopleTab = ({ peoples }) => {
  if (!peoples || peoples.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No people found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {peoples.map((person) => (
        <FollowListItem 
          key={person.id} 
          user={person}
          className="bg-white rounded-lg border"
        />
      ))}
    </div>
  );
};

export default PeopleTab; 