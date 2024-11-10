


// components/Profile/FolowPeopleSestion.js
import React from 'react';
import Link from 'next/link';
import FollowButton from '../Utils/FollowButton';
import { motion } from 'framer-motion'; // Thêm thư viện Framer Motion cho animation

export const FolowPeopleSestion = ({ peoples }) => {
  if (!peoples || peoples.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-8">
        Không tìm thấy người phù hợp.
      </p>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Folow
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {peoples.map((person) => (
          <motion.div
            key={person.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 flex flex-col items-center">
              <Link href={`/${person.username}`} legacyBehavior>
                <a className="flex flex-col items-center text-center">
                  <img
                    src={person.avatar_url || '/default-avatar.png'}
                    alt={`${person.name || 'Author'} Avatar`}
                    className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-indigo-500"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {person.name || 'Unknown Author'}
                  </h3>
                  <p className="text-sm text-gray-500">{person.username}</p>
                </a>
              </Link>
              <FollowButton authorId={person.id} className="mt-4" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FolowPeopleSestion;
