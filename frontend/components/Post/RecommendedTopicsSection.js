// components/Post/RecommendedTopicsSection.js
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const RecommendedTopicsSection = () => {
  const router = useRouter();
  
  // Mock data - replace with actual API call when ready
  const recommendedTopics = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Programming' },
    { id: 3, name: 'Web Development' },
    { id: 4, name: 'React' },
    { id: 5, name: 'JavaScript' }
  ];

  const handleSeeMore = () => {
    router.push(`/suggestion`);
  };

  return (
    <div className="p-6  border border-medium-border rounded-card">
      <h2 className="text-heading-4 font-serif font-semibold text-medium-text-primary mb-6">Đề Xuất</h2>
      <div className="flex flex-wrap gap-3">
        {recommendedTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/category/${encodeURIComponent(topic.name)}`}
            className="px-4 py-2  text-medium-text-primary rounded-full text-sm font-medium hover:bg-medium-accent-green hover:text-white transition-all duration-200"
          >
              {topic.name}
          </Link>
        ))}
      </div>
      {recommendedTopics.length > 5 && (
        <button 
          onClick={handleSeeMore}
          className="mt-4 px-4 py-2 text-sm font-medium text-medium-accent-green hover:text-medium-text-primary transition-colors duration-200"
        >
          Xem thêm
        </button>
      )}
    </div>
  );
};

export default RecommendedTopicsSection;
