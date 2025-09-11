// components/Post/PostDetail.js
import React from 'react';
import { useUser } from '../../context/UserContext';
import { FaHandsClapping, FaShare, FaBookmark } from "react-icons/fa6";
import { FaEye, FaComment, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { useClapsCount } from '../../hooks/useClapsCount';
import { clapPost } from '../../services/activityService';
import { useComments } from '../../hooks/useComments';
import TableOfContents from '../Shared/TableOfContents';
import SEOHead from '../SEO/SEOHead';
import ReadingProgress from '../Reading/ReadingProgress';
import RelatedPosts from './RelatedPosts';

export const PostDetail = ({ post, relatedPosts = [], onScrollToComments }) => {
  if (!post) {
    return <div className="flex justify-center items-center h-64 text-medium-text-muted">Đang tải bài viết...</div>;
  }

  const { clapsCount: postClapsCount, hasClapped, mutate: mutateClaps } = useClapsCount('post', post.id);
  const { user } = useUser();
  const { totalCommentReply } = useComments(post.id, true, 1, 10);

  const handleClap = async () => {
    if (!user) {
      alert('Bạn cần đăng nhập để clap.');
      return;
    }

    try {
      await clapPost(post.id);
      mutateClaps();
    } catch (error) {
      console.error('Failed to clap:', error);
      alert('Đã xảy ra lỗi khi clap. Vui lòng thử lại sau.');
    }
  };


  return (
    <>
      <SEOHead
        title={post.title}
        description={post.preview_content || post.content?.substring(0, 160)}
        image={post.image_title}
        type="article"
        publishedTime={post.created_at}
        modifiedTime={post.updated_at}
        author={post.author?.name}
        category={post.category}
        url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/p/${post.title_name}`}
      />
      <ReadingProgress />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <article className="lg:col-span-3">
          {/* Title Section */}
          <header className="mb-12">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-medium-text-primary mb-6 leading-tight text-balance">
              {post.title}
            </h1>

            {/* Post Meta Information */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 border-y border-medium-border">
              {/* Date and Reading Time */}
              <div className="flex items-center space-x-4 text-medium-text-muted">
                <time dateTime={post.created_at} className="font-medium">
                  {new Date(post.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
                <span className="w-1 h-1 bg-medium-text-muted rounded-full"></span>
                <span className="font-medium">{Math.ceil((post.content?.length || 0) / 1000)} min read</span>
              </div>

              {/* Social Actions */}
              <div className="flex items-center space-x-4">
                {/* Claps */}
                <button
                  onClick={handleClap}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 min-h-[44px] ${
                    hasClapped 
                      ? 'text-medium-accent-green bg-medium-accent-green/10' 
                      : 'text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-hover'
                  }`}
                  aria-label="Clap for this post"
                >
                  <FaHandsClapping className="w-4 h-4" />
                  <span className="font-medium">{postClapsCount}</span>
                </button>

                {/* Comments */}
                <button 
                  onClick={onScrollToComments}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-hover transition-all duration-200 min-h-[44px]"
                  aria-label="Go to comments"
                >
                  <FaComment className="w-4 h-4" />
                  <span className="font-medium">{totalCommentReply || 0}</span>
                </button>

                {/* Share Button */}
                <button 
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-medium-text-secondary hover:text-medium-accent-green hover:bg-medium-hover transition-all duration-200 min-h-[44px]"
                  aria-label="Share this post"
                >
                  <FaShare className="w-4 h-4" />
                </button>

                {/* Views */}
                <div className="flex items-center space-x-2 px-3 py-2 text-medium-text-muted">
                  <FaEye className="w-4 h-4" />
                  <span className="font-medium">{post.views || 0}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.image_title && (
            <div className="mb-12">
              <img
                src={post.image_title}
                alt={post.title}
                className="w-full h-auto rounded-xl"
                loading="eager"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
            <div
              className="post-content reading-content text-medium-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">
            {/* Table of Contents */}
            <TableOfContents content={post.content} />
            
            {/* Author Info Card */}
            <div className="bg-medium-bg-card rounded-xl p-6">
              <h3 className="font-bold text-medium-text-primary mb-4">About the Author</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-medium-accent-green rounded-full flex items-center justify-center text-white font-bold">
                  {post.author?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-medium-text-primary">{post.author?.name || 'Author'}</p>
                  <p className="text-sm text-medium-text-secondary mt-1">
                    Sharing insights and experiences through writing.
                  </p>
                </div>
              </div>
            </div>

            {/* Share Options */}
            <div className="bg-medium-bg-card rounded-xl p-6">
              <h3 className="font-bold text-medium-text-primary mb-4">Share this article</h3>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-medium-hover transition-colors duration-200 text-left">
                  <FaTwitter className="w-5 h-5 text-blue-400" />
                  <span className="text-medium-text-primary">Share on Twitter</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-medium-hover transition-colors duration-200 text-left">
                  <FaLinkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-medium-text-primary">Share on LinkedIn</span>
                </button>
                <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-medium-hover transition-colors duration-200 text-left">
                  <FaBookmark className="w-5 h-5 text-medium-text-secondary" />
                  <span className="text-medium-text-primary">Bookmark</span>
                </button>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <RelatedPosts 
                posts={relatedPosts} 
                currentPostId={post.id}
              />
            )}
          </div>
        </aside>
      </div>
      </div>
    </>
  );
};

export default PostDetail;