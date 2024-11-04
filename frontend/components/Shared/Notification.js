// components/Shared/Notification.js
import React from 'react';

const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
  //alert(message)

  // return (
  //   // <div className={`fixed top-4 right-4 p-4 rounded shadow ${bgColor} text-white flex items-center justify-between`}>
  //   //   <span>{message}</span>
  //   //   <button onClick={onClose} className="ml-4">&times;</button>
  //   // </div>
    
  // );
};

export default Notification;
