// components/Utils/ErrorMessage.js
import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="flex justify-center items-center py-4">
      <p className="text-red-500">{message}</p>
    </div>
  );
};

export default ErrorMessage;
