
// components/Search/Tabs/PeopleTab.js
import React from 'react';
import AuthorInfo from '../../Auth/AuthorInfo'; // Sử dụng default import

export const PeopleTab = ({ peoples }) => {
  if (!peoples || peoples.length === 0) {
    return <p className="text-gray-600">Không tìm thấy người phù hợp.</p>;
  }

  return (
    <div>
      {peoples.map((person) => (
        <div key={person.id} className="mb-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          {/* Sử dụng AuthorInfo để hiển thị avatar và FollowButton */}
          <AuthorInfo author={{ 
            id: person.id, 
            username: person.username, 
            name: person.name, 
            avatar_url: person.avatar_url
          }} />
          <p className="text-gray-600">{person.email}</p>
          <p className="text-gray-600">{person.phone}</p>
        </div>
      ))}
    </div>
  );
};

export default PeopleTab;


