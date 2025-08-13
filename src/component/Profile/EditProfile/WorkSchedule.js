// src/component/WorkSchedule.js
import React from 'react';

const WorkSchedule = ({ schedule, onScheduleChange }) => {
  if (!schedule || schedule.length === 0) {
    return <div className="text-gray-500">No work schedule available</div>;
  }

  return (
    <section className="bg-[#FFF4E6] rounded-xl p-6 shadow-inner">
      <h2 className="text-xl font-semibold text-[#EA7125] mb-6 border-l-4 border-[#EA7125] pl-4">Work Schedule</h2>
      <div className="space-y-4">
        {schedule.map((item, index) => (
          <div key={item.id || index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={item.days}
                  onChange={(e) => onScheduleChange(index, 'days', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Day</label>
              <input
                type="text"
                value={item.start_day_name}
                onChange={(e) => onScheduleChange(index, 'start_day_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Day</label>
              <input
                type="text"
                value={item.end_day_name}
                onChange={(e) => onScheduleChange(index, 'end_day_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={item.start_time}
                onChange={(e) => onScheduleChange(index, 'start_time', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={item.end_time}
                onChange={(e) => onScheduleChange(index, 'end_time', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA7125] focus:border-[#EA7125] transition-all"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WorkSchedule;