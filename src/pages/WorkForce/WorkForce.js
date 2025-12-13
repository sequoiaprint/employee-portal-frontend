import React from 'react';
import { Outlet } from 'react-router-dom';

const WorkForce = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-8xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WorkForce;