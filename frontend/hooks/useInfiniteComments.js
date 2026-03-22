// hooks/useInfiniteComments.js
import { getCommentsForPost } from '../services/commentService';
import { useInfiniteCursor } from './useInfiniteCursor';

export const useInfiniteComments = (postId, isEnabled = true, pageSize = 5) => {
  const { items: comments, ...rest } = useInfiniteCursor({
    resourceUrl: `/posts/${postId}/comments`,
    fetcher: (cursor, limit) => getCommentsForPost(postId, cursor, limit),
    pageSize,
    enabled: isEnabled && !!postId,
    dedupe: true,
  });

  return { comments, ...rest };
};
