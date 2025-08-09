import React from 'react';

const RecentActivity = () => {
  const activities = [
    { id: 1, text: 'Completed project review', color: 'bg-green-500' },
    { id: 2, text: 'Updated profile information', color: 'bg-blue-500' },
    { id: 3, text: 'Joined team meeting', color: 'bg-orange-500' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
            <p className="text-sm text-gray-600">{activity.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;