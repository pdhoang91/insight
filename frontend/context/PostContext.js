// contexts/PostContext.js
import { createContext, useContext, useState } from 'react';

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

  return (
    <PostContext.Provider value={{ handlePublish, setHandlePublish, handleUpdate, setHandleUpdate }}>
      {children}
    </PostContext.Provider>
  );
};

export default PostContext;
