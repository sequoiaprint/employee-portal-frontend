import React from 'react';
import { Outlet } from 'react-router-dom';

const WorkForce = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="2xl:max-w-8xl max-w-full mx-auto py-3 px-4  2xl:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WorkForce;