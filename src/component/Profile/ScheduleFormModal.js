import React from 'react';

const ScheduleFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  schedule,
  mode = 'add', // 'add' or 'edit'
}) => {
  const [formData, setFormData] = React.useState({
    start_day_name: schedule?.start_day_name || 'Monday',
    end_day_name: schedule?.end_day_name || 'Friday',
    start_time: schedule?.start_time || '09:00:00',
    end_time: schedule?.end_time || '17:00:00',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'add' ? 'Add' : 'Edit'} Work Schedule
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Day
              </label>
              <select
                name="start_day_name"
                value={formData.start_day_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Day
              </label>
              <select
                name="end_day_name"
                value={formData.end_day_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="900" // 15 minute intervals
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="900" // 15 minute intervals
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {mode === 'add' ? 'Add' : 'Save'} Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleFormModal;