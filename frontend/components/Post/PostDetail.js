// components/Post/PostDetail.js
import React, { useMemo } from 'react';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaShare } from 'react-icons/fa6';
import { FaEye, FaComment } from 'react-icons/fa';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import TableOfContents from '../Shared/TableOfContents';
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

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Article */}
        <article className="flex-1 min-w-0 max-w-[720px]">
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-medium-text-primary leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-y border-medium-border">
              <div className="flex items-center gap-3 text-sm text-medium-text-muted">
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </time>
                <span className="w-1 h-1 bg-medium-text-muted rounded-full" />
                <span>{Math.ceil((plainText?.length || 0) / 1000)} min read</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClap}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    hasClapped
                      ? 'text-medium-accent-green bg-medium-accent-green/10'
                      : 'text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-hover'
                  }`}
                >
                  <FaHandsClapping className="w-4 h-4" />
                  <span className="font-medium">{postClapsCount}</span>
                </button>

                <button
                  onClick={onScrollToComments}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-hover transition-colors"
                >
                  <FaComment className="w-4 h-4" />
                  <span className="font-medium">{totalCommentReply || 0}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center px-3 py-1.5 rounded-full text-sm text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-hover transition-colors"
                >
                  <FaShare className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-medium-text-muted">
                  <FaEye className="w-4 h-4" />
                  <span>{post.views || 0}</span>
                </div>
              </div>
            </div>
          </header>

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

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
            </div>
          )}
        </article>

        {/* TOC Sidebar */}
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
