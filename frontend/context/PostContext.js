// contexts/PostContext.js
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const PostContext = createContext({
  handlePublish: null,
  setHandlePublish: () => {},
  handleUpdate: null,
  setHandleUpdate: () => {},
});

export const usePostContext = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [handlePublish, setHandlePublish] = useState(null);
  const [handleUpdate, setHandleUpdate] = useState(null);

  const stableSetHandlePublish = useCallback((fn) => {
    setHandlePublish(fn);
  }, []);

  const stableSetHandleUpdate = useCallback((fn) => {
    setHandleUpdate(fn);
  }, []);

  const value = useMemo(() => ({
    handlePublish,
    setHandlePublish: stableSetHandlePublish,
    handleUpdate,
    setHandleUpdate: stableSetHandleUpdate,
  }), [handlePublish, handleUpdate, stableSetHandlePublish, stableSetHandleUpdate]);

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
};

export default PostContext;
