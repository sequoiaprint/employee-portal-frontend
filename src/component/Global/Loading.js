// components/Loading.js
import React from 'react';

const Loading = ({ size = 16, color = "border-blue-500" }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className={`animate-spin rounded-full h-${size} w-${size} border-b-2 ${color}`}
      ></div>
    </div>
  );
};

export default Loading;
