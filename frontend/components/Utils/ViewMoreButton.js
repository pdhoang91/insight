// // components/Utils/ViewMoreButton.js
// import React from 'react';

// const ViewMoreButton = ({ onClick, className = '', children = 'see more' }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={`mt-4 inline-block px-3 py-2 border border-gray-300 text-gray-600 rounded-full text-center transition-colors hover:bg-gray-100 ${className}`}
//     >
//       {children}
//     </button>
//   );
// };

// export default ViewMoreButton;


//components/Utils/ViewMoreButton.js
import React from 'react';

const ViewMoreButton = ({ onClick, className = '', children = 'see more' }) => {
  return (
    <button
      onClick={onClick}
      className={`mt-4 inline-block px-2 py-1 border border-gray-300 text-gray-500 text-sm rounded-full text-center transition-colors hover:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
};

export default ViewMoreButton;

// components/Utils/ViewMoreButton.js
// import React from 'react';

// const ViewMoreButton = ({ onClick, className = '', children = 'see more' }) => {
//   return (
//     <button
//       onClick={onClick}
//       className={`mt-4 text-green-600 text-sm hover:text-green-700 transition-colors ${className}`}
//       style={{ background: 'none', border: 'none', padding: 0 }}
//     >
//       {children}
//     </button>
//   );
// };

// export default ViewMoreButton;
