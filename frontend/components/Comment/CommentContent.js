// // components/Comment/CommentContent.js
// // src/components/Comment/CommentContent.js
// import React from 'react';
// import Mention from './Mention';

// const CommentContent = ({ content }) => {
//   // Function to highlight mentions
//   const renderContent = (content) => {
//     const regex = /@(\w+)/g;
//     const parts = [];
//     let lastIndex = 0;
//     let match;

//     while ((match = regex.exec(content)) !== null) {
//       parts.push(content.substring(lastIndex, match.index));
//       parts.push(
//         <Mention
//           key={match.index}
//           username={match[1]}
//           className="text-blue-500 hover:underline cursor-pointer"
//         />
//       );
//       lastIndex = regex.lastIndex;
//     }

//     parts.push(content.substring(lastIndex));
//     return parts;
//   };

//   return <p className="text-sm text-gray-700">{renderContent(content)}</p>;
// };

// export default CommentContent;


// src/components/Comment/CommentContent.js
import React from 'react';
import Mention from './Mention';

const CommentContent = ({ content }) => {
  // Function to highlight mentions
  const renderContent = (content) => {
    const regex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      parts.push(content.substring(lastIndex, match.index));
      parts.push(
        <Mention
          key={match.index}
          username={match[1]}
          className="text-blue-500 hover:underline cursor-pointer"
        />
      );
      lastIndex = regex.lastIndex;
    }

    parts.push(content.substring(lastIndex));
    return parts;
  };

  return <p className="text-sm text-gray-700">{renderContent(content)}</p>;
};

export default CommentContent;
