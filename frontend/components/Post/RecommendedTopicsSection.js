// components/Post/RecommendedTopicsSection.js
import React from 'react';
import { useRecommendedTopics } from '../../hooks/useRecommendedTopics';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ViewMoreButton from '../../components/Utils/ViewMoreButton';

const RecommendedTopicsSection = () => {
  const { recommendedTopics, isLoading, isError } = useRecommendedTopics();
  const router = useRouter();
  if (isError) return <div className="text-medium-text-accent">Không thể tải chủ đề được đề xuất</div>;
  if (isLoading) return <div className="text-medium-text-secondary">Đang tải...</div>;

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
       <ViewMoreButton onClick={handleSeeMore} />
      )}
    </div>
  );
};

export default RecommendedTopicsSection;
