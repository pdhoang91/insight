// // components/Shared/ProfileRightSidebar.js
// import React from 'react';
// import { motion } from 'framer-motion';
// import useProfileRightSidebar from '../../hooks/useProfileRightSidebar';
// import Notification from './Notification';

// const ProfileRightSidebar = ({ currentUser, viewedUsername }) => {
  
//   const {
//     moreProfiles,
//     loadingMore,
//     loadingPeople,
//     error,
//     handleFollow,
//     handleUnfollow,
//     followStatus,
//     notification,
//     closeNotification,
//   } = useProfileRightSidebar(currentUser, viewedUsername);

//   return (
//     <div className="space-y-8">
//       {/* Notification */}
//       <Notification message={notification.message} type={notification.type} onClose={closeNotification} />

//       {/* More Profiles for You */}
//       <div>
//         <h3 className="text-xl font-semibold mb-4">More Profiles for You</h3>
//         {loadingMore ? (
//           <div>Loading...</div>
//         ) : (
//           moreProfiles.length > 0 ? (
//             moreProfiles.map(profile => (
//               <motion.div
//                 key={profile.id}
//                 className="flex items-center mb-4 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
//                 whileHover={{ scale: 1.02 }}
//               >
//                 <img
//                   src={profile.avatar_url || '/default-avatar.png'}
//                   alt={profile.name}
//                   className="w-12 h-12 rounded-full mr-4 object-cover"
//                 />
//                 <div className="flex-1">
//                   <p className="font-semibold">{profile.name}</p>
//                   <p className="text-sm text-gray-600">@{profile.username}</p>
//                 </div>
//                 {followStatus[profile.id] ? (
//                   <button
//                     onClick={() => handleUnfollow(profile.id)}
//                     className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
//                   >
//                     Unfollow
//                   </button>
//                 ) : (
//                   <button
//                     onClick={() => handleFollow(profile.id)}
//                     className="px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
//                   >
//                     Follow
//                   </button>
//                 )}
//               </motion.div>
//             ))
//           ) : (
//             <div>No suggested profiles found.</div>
//           )
//         )}
//       </div>

//       {/* Hiển thị thông báo lỗi chung nếu có */}
//       {error && <div className="text-red-500">{error}</div>}
//     </div>
//   );
// };

// export default ProfileRightSidebar;
