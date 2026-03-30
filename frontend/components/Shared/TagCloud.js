'use client';
import React from 'react';
import Link from 'next/link';

// Rank thresholds → font size/weight tiers
const TAG_TIERS = [
  { maxRank: 0.10, fontSize: '1.6rem',  fontWeight: 700 },
  { maxRank: 0.20, fontSize: '1.25rem', fontWeight: 700 },
  { maxRank: 0.40, fontSize: '1rem',    fontWeight: 600 },
  { maxRank: 0.65, fontSize: '0.85rem', fontWeight: 400 },
  { maxRank: 1.00, fontSize: '0.75rem', fontWeight: 400 },
];

const getTagStyle = (rank) => {
  const tier = TAG_TIERS.find((t) => rank < t.maxRank) || TAG_TIERS[TAG_TIERS.length - 1];
  return { fontSize: tier.fontSize, fontWeight: tier.fontWeight };
};

const TagCloudSkeleton = () => (
  <div className="flex flex-wrap gap-x-3 gap-y-2">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="skeleton-warm"
        style={{ height: `${14 + (i % 4) * 4}px`, width: `${45 + (i % 5) * 18}px`, borderRadius: '2px' }}
      />
    ))}
  </div>
);

const TagCloud = ({ tags, isLoading, limit = 40 }) => {
  if (isLoading) return <TagCloudSkeleton />;

  const list = (tags || []).slice(0, limit);
  const total = list.length;

  if (!total) return null;

  return (
    <div className="leading-loose">
      {list.map((tag, i) => {
        const { fontSize, fontWeight } = getTagStyle(i / total);
        return (
          <Link
            key={tag.id || tag.name}
            href={`/tag/${tag.name}`}
            style={{ fontSize, fontWeight, lineHeight: 1.6 }}
            className="inline-block mr-2 text-[var(--accent)] hover:underline"
          >
            {tag.name}
          </Link>
        );
      })}
    </div>
  );
};

export default TagCloud;
