// src/components/Comment/Mention.js
import React from 'react';
import Link from 'next/link';

const Mention = ({ username, className }) => {
  return (
    <Link 
      href={`/@${username}`}
      className={`font-mono font-semibold text-matrix-cyan hover:text-matrix-green transition-colors hover:underline ${className || ''}`}
    >
      @{username}
    </Link>
  );
};

export default Mention;
