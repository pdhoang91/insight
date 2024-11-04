// components/Utils/FollowButton.js
import React from 'react';
import { SlUserFollow, SlUserFollowing } from "react-icons/sl";
import useFollow from '../../hooks/useFollow';
import { useUser } from '../../context/UserContext';

const FollowButton = ({ authorId }) => {
  const { isFollowing, toggleFollow, loading } = useFollow(authorId);
  const { user } = useUser();

  const showButton = user && authorId && user.id !== authorId;

  if (!showButton) return null;

  return (
    <button onClick={toggleFollow} className="ml-2 text-blue-500" disabled={loading}>
      {isFollowing ? <SlUserFollowing /> : <SlUserFollow />}
    </button>
  );
};

export default FollowButton;
