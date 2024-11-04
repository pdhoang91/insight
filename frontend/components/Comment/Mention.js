// src/components/Comment/Mention.js
import React from 'react';
import Link from 'next/link';

const Mention = ({ username, className }) => {
  return (
    <Link href={`/@${username}`}>
      <a className={`font-semibold ${className}`}>
        @{username}
      </a>
    </Link>
  );
};

export default Mention;
