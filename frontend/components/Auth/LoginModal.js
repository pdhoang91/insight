// // components/Auth/LoginModal.js
// import React from 'react';
// import { loginWithGoogle } from '../../services/authService';
// import { useLoginModal } from '../../hooks/useLoginModal';

// const LoginModal = ({ isOpen, onClose }) => {
//   // Sử dụng custom hook để xử lý logic đóng modal
//   useLoginModal(isOpen, onClose);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-out z-60">
//       <div
//         className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md mx-4 transform transition-transform duration-300 ease-out scale-95 hover:scale-100 opacity-100 z-90"
//         style={{
//           animation: 'fadeIn 0.3s ease-out',
//         }}
//       >
//         <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500 mb-6 text-center">
//           Welcome Back
//         </h2>
//         <p className="text-gray-400 mb-8 text-center">
//           Sign in to continue your journey with us.
//         </p>
//         <div className="flex flex-col items-center space-y-4">
//           <button
//             onClick={loginWithGoogle}
//             className="bg-gradient-to-r from-blue-600 to-teal-400 text-white w-full py-3 rounded-full text-lg font-semibold shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:shadow-xl"
//           >
//             Sign In with Google
//           </button>
//           <button
//             onClick={onClose}
//             className="w-full py-3 rounded-full text-lg font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors hover:text-white"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//       <style jsx global>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: scale(0.9);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LoginModal;

import React from 'react';
import { loginWithGoogle } from '../../services/authService';
import { useLoginModal } from '../../hooks/useLoginModal';

const LoginModal = ({ isOpen, onClose }) => {
  useLoginModal(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ease-out z-50"
      onClick={onClose} // Xử lý sự kiện click để đóng modal
    >
      <div
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md mx-4 transform transition-transform duration-300 ease-out scale-95 hover:scale-100 opacity-100 z-60"
        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click bên trong modal
        style={{
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-500 mb-6 text-center">
          Welcome Back
        </h2>
        <p className="text-gray-400 mb-8 text-center">
          Sign in to continue your journey with us.
        </p>
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={loginWithGoogle}
            className="bg-gradient-to-r from-blue-600 to-teal-400 text-white w-full py-3 rounded-full text-lg font-semibold shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:shadow-xl"
          >
            Sign In with Google
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full text-lg font-semibold text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LoginModal;


