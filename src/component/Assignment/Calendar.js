import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ selectedDate, onDateSelect, tasks }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [persistedDate, setPersistedDate] = useState(null);

  // Load saved date from localStorage on mount
  useEffect(() => {
    const savedDate = localStorage.getItem("selectedDate");
    if (savedDate) {
      const parsedDate = new Date(savedDate);
      setPersistedDate(parsedDate);
      onDateSelect(parsedDate); // Notify parent as well
    }
  }, []);

  // Save whenever user selects a new date
  const handleDateSelect = (date) => {
    localStorage.setItem("selectedDate", date.toISOString());
    setPersistedDate(date);
    onDateSelect(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, 0 - (startingDayOfWeek - 1 - i));
      days.push({ date: prevMonthDay.getDate(), isCurrentMonth: false, fullDate: prevMonthDay });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      days.push({ date: day, isCurrentMonth: true, fullDate });
    }

    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      days.push({ date: day, isCurrentMonth: false, fullDate: nextMonthDay });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return persistedDate && date.toDateString() === persistedDate.toDateString();
  };

  const taskCountOnDate = (date) => {
    if (!tasks) return 0;
    return tasks.filter(task => task.dueDate.toDateString() === date.toDateString()).length;
  };

  const getTaskDayClass = (count) => {
    if (count === 1) return "bg-green-100 text-green-700 font-semibold";
    if (count === 2) return "bg-orange-100 text-orange-700 font-semibold";
    if (count >= 3) return "bg-red-100 text-red-700 font-semibold";
    return "";
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Task Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-[100px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const count = taskCountOnDate(day.fullDate);
          return (
            <button
              key={index}
              onClick={() => handleDateSelect(day.fullDate)}
              className={`
                aspect-square flex items-center justify-center text-xs rounded-md transition-colors
                ${day.isCurrentMonth ? 'text-gray-900 hover:bg-gray-200' : 'text-gray-400'}
                ${isToday(day.fullDate) ? 'ring-2 ring-blue-400' : ''}
                ${isSelected(day.fullDate) ? 'bg-blue-500 text-gray-700' : ''}
                ${getTaskDayClass(count)}
              `}
            >
              {day.date}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
