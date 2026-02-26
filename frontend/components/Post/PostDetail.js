// components/Post/PostDetail.js — Medium-style post detail
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaShare } from 'react-icons/fa6';
import { FaComment, FaUser, FaBookmark, FaEdit, FaTrash } from 'react-icons/fa';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { deletePost } from '../../services/postService';
import { useComments } from '../../hooks/useComments';
import SEOHead from '../SEO/SEOHead';
import RelatedPosts from './RelatedPosts';
import { renderPostContent, getContentPlainText } from '../../utils/renderContent';

export const PostDetail = ({ post, relatedPosts = [], onScrollToComments }) => {
  if (!post) {
    return (
      <div className="flex justify-center items-center h-64 text-[#6b6b6b]">
        Loading...
      </div>
    );
  }

  const router = useRouter();
  const { clapsCount: postClapsCount, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { totalCommentReply } = useComments(post.id, true, 1, 10);

  const isOwner = user && post.user && user.id === post.user.id;

  const renderedHTML = useMemo(() => renderPostContent(post.content), [post.content]);
  const plainText = useMemo(() => getContentPlainText(post.content), [post.content]);
  const readTime = Math.max(1, Math.ceil((plainText?.length || 0) / 1000));

  const handleClap = async () => {
    if (!user) return;
    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (e) {
      console.error('Clap failed:', e);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/p/${post.slug}`;
    navigator.clipboard.writeText(url);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      router.push('/');
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || plainText?.substring(0, 160)}
        image={post.cover_image}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        author={post.user?.name}
        category={post.category}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/p/${post.slug}`}
      />

      <article className="max-w-[680px] mx-auto">
        {/* Title */}
        <h1 className="font-serif text-[32px] lg:text-[42px] font-bold text-[#242424] leading-[1.2] mb-8">
          {post.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full bg-medium-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {post.user?.avatar_url ? (
              <img src={post.user.avatar_url} alt={post.user.name} className="w-full h-full object-cover" />
            ) : (
              <FaUser className="w-4 h-4 text-[#6b6b6b]" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-[#242424] hover:underline cursor-pointer">
              {post.user?.name || 'Anonymous'}
            </div>
            <div className="flex items-center gap-1 text-sm text-[#6b6b6b]">
              <span>{readTime} min read</span>
              <span>·</span>
              <time dateTime={post.created_at}>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </time>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between py-3 border-y border-medium-border mb-8">
          <div className="flex items-center gap-5">
            <button
              onClick={handleClap}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                hasClapped ? 'text-medium-accent-green' : 'text-[#6b6b6b] hover:text-[#242424]'
              }`}
            >
              <FaHandsClapping className="w-5 h-5" />
              {postClapsCount > 0 && <span>{postClapsCount}</span>}
            </button>

            <button
              onClick={onScrollToComments}
              className="flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#242424] transition-colors"
            >
              <FaComment className="w-5 h-5" />
              {totalCommentReply > 0 && <span>{totalCommentReply}</span>}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {isOwner && (
              <>
                <Link
                  href={`/edit/${post.slug}`}
                  className="text-[#6b6b6b] hover:text-[#242424] transition-colors"
                  title="Edit"
                >
                  <FaEdit className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-[#6b6b6b] hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              className="text-[#6b6b6b] hover:text-[#242424] transition-colors"
              title="Bookmark"
            >
              <FaBookmark className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="text-[#6b6b6b] hover:text-[#242424] transition-colors"
              title="Share"
            >
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-10">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto"
              loading="eager"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="post-content reading-content text-[#242424]"
          style={{ fontSize: '21px', lineHeight: '1.58' }}
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
        />

        {/* Tags — plain text with · separators */}
        {post.categories?.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-12 pt-8 border-t border-medium-border">
            {post.categories.map((cat, i) => (
              <React.Fragment key={cat.id || cat.name}>
                {i > 0 && <span className="text-[#6b6b6b]">·</span>}
                <Link
                  href={`/category/${cat.name}`}
                  className="text-sm text-[#6b6b6b] hover:text-[#242424] hover:underline transition-colors"
                >
                  {cat.name}
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Bottom stats bar */}
        <div className="flex items-center justify-between py-3 border-y border-medium-border mt-8">
          <div className="flex items-center gap-5">
            <button
              onClick={handleClap}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                hasClapped ? 'text-medium-accent-green' : 'text-[#6b6b6b] hover:text-[#242424]'
              }`}
            >
              <FaHandsClapping className="w-5 h-5" />
              {postClapsCount > 0 && <span>{postClapsCount}</span>}
            </button>

            <button
              onClick={onScrollToComments}
              className="flex items-center gap-1.5 text-sm text-[#6b6b6b] hover:text-[#242424] transition-colors"
            >
              <FaComment className="w-5 h-5" />
              {totalCommentReply > 0 && <span>{totalCommentReply}</span>}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="text-[#6b6b6b] hover:text-[#242424] transition-colors"
              title="Bookmark"
            >
              <FaBookmark className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="text-[#6b6b6b] hover:text-[#242424] transition-colors"
              title="Share"
            >
              <FaShare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Author bio card */}
        <div className="flex items-start gap-4 mt-10 py-6">
          <div className="w-[72px] h-[72px] rounded-full bg-medium-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {post.user?.avatar_url ? (
              <img src={post.user.avatar_url} alt={post.user.name} className="w-full h-full object-cover" />
            ) : (
              <FaUser className="w-6 h-6 text-[#6b6b6b]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#6b6b6b] uppercase tracking-wider mb-1">Written by</p>
            <h3 className="text-lg font-bold text-[#242424] hover:underline cursor-pointer">
              {post.user?.name || 'Anonymous'}
            </h3>
            {post.user?.bio && (
              <p className="text-sm text-[#6b6b6b] mt-1 leading-relaxed">
                {post.user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-medium-border">
            <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
          </div>
        )}
      </article>
    </>
  );
};

export default PostDetail;
