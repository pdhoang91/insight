// hooks/useCommentReplies.js
import { getRepliesForComment } from '../services/commentService';
import { useInfiniteCursor } from './useInfiniteCursor';

export const useCommentReplies = (commentId, isEnabled = false, pageSize = 10) => {
  const { items: replies, ...rest } = useInfiniteCursor({
    resourceUrl: `/comments/${commentId}/replies`,
    fetcher: (cursor, limit) => getRepliesForComment(commentId, cursor, limit),
    pageSize,
    enabled: isEnabled && !!commentId,
    swrOptions: { errorRetryCount: 2 },
  });

  return { replies, ...rest };
};
