// components/Post/PostDetail.js
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaShare } from 'react-icons/fa6';
import { FaEye, FaComment, FaUser } from 'react-icons/fa';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import TableOfContents from '../Shared/TableOfContents';
import ReadingProgressBar from '../Shared/ReadingProgressBar';
import SEOHead from '../SEO/SEOHead';
import RelatedPosts from './RelatedPosts';
import { renderPostContent, getContentPlainText } from '../../utils/renderContent';

export const PostDetail = ({ post, relatedPosts = [], onScrollToComments }) => {
  if (!post) {
    return (
      <div className="flex justify-center items-center h-64 text-medium-text-muted">
        Đang tải bài viết...
      </div>
    );
  }

  const { clapsCount: postClapsCount, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { totalCommentReply } = useComments(post.id, true, 1, 10);

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

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || plainText?.substring(0, 160)}
        image={post.cover_image}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        author={post.author?.name}
        category={post.category}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/p/${post.slug}`}
      />

      <ReadingProgressBar />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Article */}
        <article className="flex-1 min-w-0 max-w-[720px]">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-medium-text-primary leading-tight mb-6">
              {post.title}
            </h1>

            {/* Author info — 200lab style */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-medium-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt={post.author.name} className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="w-4 h-4 text-medium-text-muted" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-medium-text-primary">
                  {post.author?.name || 'Anonymous'}
                </div>
                <div className="flex items-center gap-2 text-xs text-medium-text-muted">
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </time>
                  <span>·</span>
                  <span>{readTime} min read</span>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center justify-between py-3 border-y border-medium-border">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleClap}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    hasClapped ? 'text-medium-accent-green' : 'text-medium-text-secondary hover:text-medium-accent-green'
                  }`}
                >
                  <FaHandsClapping className="w-4 h-4" />
                  <span>{postClapsCount}</span>
                </button>

                <button
                  onClick={onScrollToComments}
                  className="flex items-center gap-1.5 text-sm text-medium-text-secondary hover:text-medium-accent-green transition-colors"
                >
                  <FaComment className="w-4 h-4" />
                  <span>{totalCommentReply || 0}</span>
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-medium-text-muted">
                  <FaEye className="w-4 h-4" />
                  <span>{post.views || 0}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="text-sm text-medium-text-secondary hover:text-medium-accent-green transition-colors"
                  title="Copy link"
                >
                  <FaShare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Mobile TOC — collapsible card */}
          <div className="lg:hidden mb-8">
            <TableOfContents content={renderedHTML} collapsible />
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="mb-8">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-auto rounded-lg"
                loading="eager"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg prose-gray max-w-none">
            <div
              className="post-content reading-content leading-relaxed text-medium-text-primary"
              dangerouslySetInnerHTML={{ __html: renderedHTML }}
            />
          </div>

          {/* Tags at bottom */}
          {post.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-medium-border">
              {post.categories.map(cat => (
                <Link
                  key={cat.id || cat.name}
                  href={`/category/${cat.name}`}
                  className="px-3 py-1 bg-medium-bg-secondary text-medium-text-secondary text-sm rounded-full hover:text-medium-accent-green transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share at bottom */}
          <div className="flex items-center gap-4 mt-6 py-4 border-t border-medium-border">
            <button
              onClick={handleClap}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                hasClapped ? 'text-medium-accent-green' : 'text-medium-text-secondary hover:text-medium-accent-green'
              }`}
            >
              <FaHandsClapping className="w-4 h-4" />
              <span>{postClapsCount}</span>
            </button>
            <button
              onClick={onScrollToComments}
              className="flex items-center gap-1.5 text-sm text-medium-text-secondary hover:text-medium-accent-green transition-colors"
            >
              <FaComment className="w-4 h-4" />
              <span>{totalCommentReply || 0}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm text-medium-text-secondary hover:text-medium-accent-green transition-colors"
            >
              <FaShare className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
            </div>
          )}
        </article>

        {/* TOC Sidebar — desktop only */}
        <aside className="hidden lg:block w-[250px] flex-shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
            <TableOfContents content={renderedHTML} />
          </div>
        </aside>
      </div>
    </>
  );
};

export default PostDetail;
