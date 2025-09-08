// components/Post/RecommendedTopicsSection.js
import React from 'react';
import { useRecommendedTopics } from '../../hooks/useRecommendedTopics';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ViewMoreButton from '../../components/Utils/ViewMoreButton';

const RecommendedTopicsSection = () => {
  const { recommendedTopics, isLoading, isError } = useRecommendedTopics();
  const router = useRouter();
  if (isError) return <div className="text-red-500">Không thể tải chủ đề được đề xuất</div>;
  if (isLoading) return <div>Đang tải...</div>;

  const handleSeeMore = () => {
    router.push(`/suggestion`);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Đề Xuất</h2>
      <div className="flex flex-wrap gap-2">
        {recommendedTopics.map((topic) => (
          <Link
            key={topic.id}
            href={`/category/${encodeURIComponent(topic.name)}`}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
              {topic.name}
          </Link>
        ))}
      </div>
      {recommendedTopics.length > 5 && (

       <ViewMoreButton onClick={handleSeeMore} />
        // <button
        //   href="#"
        //   onClick={handleSeeMore}
        //   className="mt-4 inline-block px-6 py-2 border border-gray-300 text-gray-600 rounded-full text-center transition-colors hover:bg-gray-100"
        // >
        //   View More
        // </button>

      )}
    </div>
  );
};

export default RecommendedTopicsSection;
