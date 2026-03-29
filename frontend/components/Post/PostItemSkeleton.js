// components/Post/PostItemSkeleton.js — matches BasePostItem default layout
const PostItemSkeleton = () => (
  <div className="mb-5">
    {/* Cover image placeholder — full width, 16:9 */}
    <div className="skeleton-warm w-full" style={{ paddingTop: '56.25%' }} />

    {/* Content section */}
    <div className="pt-4 pb-5 space-y-3">
      {/* Category */}
      <div className="skeleton-warm h-[0.65rem] w-[40%] rounded-[2px]" />
      {/* Title — two lines */}
      <div className="skeleton-warm h-[1.35rem] w-[95%] rounded-[2px]" />
      <div className="skeleton-warm h-[1.35rem] w-[70%] rounded-[2px]" />
      {/* Meta */}
      <div className="flex gap-4 pt-1">
        <div className="skeleton-warm h-[0.65rem] w-[5rem] rounded-[2px]" />
        <div className="skeleton-warm h-[0.65rem] w-[7rem] rounded-[2px]" />
      </div>
      {/* Excerpt */}
      <div className="skeleton-warm h-[0.85rem] w-full rounded-[2px]" />
      <div className="skeleton-warm h-[0.85rem] w-[90%] rounded-[2px]" />
      <div className="skeleton-warm h-[0.85rem] w-[75%] rounded-[2px]" />
      {/* Continue reading */}
      <div className="skeleton-warm h-[0.75rem] w-[8rem] rounded-[2px]" />
    </div>
  </div>
);

export default PostItemSkeleton;
