import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Stats from '../../../component/WorkForce/attendance/Stats';
import LateEmployees from '../../../component/WorkForce/attendance/LateEmployees';
import NoClockOut from '../../../component/WorkForce/attendance/NoClockOut';
import AttendanceDashboard from '../../../component/WorkForce/attendance/ProofCtpStats';
import AbsentDashboard2 from '../../../component/WorkForce/attendance/leaveStats';

const Attendance = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [floorFilter, setFloorFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState(null); // Initialize as null instead of empty string
  const [isFilterReady, setIsFilterReady] = useState(false); // Track if filters are ready

  // Format date for API: YYYY-MM-DD
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display: MMM-DD
  const formatDateForDisplay = (date) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  };

  // Update timeFilter when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const formattedTimeFilter = `${formatDateForAPI(startDate)}_to_${formatDateForAPI(endDate)}`;
      setTimeFilter(formattedTimeFilter);
      setIsFilterReady(true); // Mark filters as ready
    }
  }, [startDate, endDate]);

  // Handle end date change (ensure it's not before start date)
  const handleEndDateChange = (date) => {
    if (date && startDate && date >= startDate) {
      setEndDate(date);
    } else if (date && date < startDate) {
      setEndDate(date);
      setStartDate(date);
    }
  };

  // Handle start date change (ensure it's not after end date)
  const handleStartDateChange = (date) => {
    if (date && endDate && date <= endDate) {
      setStartDate(date);
    } else if (date && date > endDate) {
      setStartDate(date);
      setEndDate(date);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Attendance & Punctuality</h2>
        </div>

        {/* Filters */}
        <div className='flex flex-row gap-8 px-6'>
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <div className="flex flex-col gap-2">
                <div className="w-full sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={endDate}
                    dateFormat="MMM-dd"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    wrapperClassName="w-full"
                    popperClassName="z-50"
                    showPopperArrow={false}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    maxDate={new Date()}
                    dateFormat="MMM-dd"
                    className="border border-gray-300 rounded-lg px-3 z-[1000] py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    wrapperClassName="w-full"
                    popperClassName="z-150"
                    showPopperArrow={false}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
              >
                <option value="all">All Floors</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="1st Floor">1st Floor</option>
                <option value="2nd Floor">2nd Floor</option>
                <option value="3rd Floor">3rd Floor</option>
                <option value="4th Floor">4th Floor</option>
                <option value="5th Floor">5th Floor</option>
              </select>
            </div>
          </div>
          
          {/* Only render Stats when filters are ready */}
          {isFilterReady && timeFilter ? (
            <Stats timeFilter={timeFilter} floorFilter={floorFilter} />
          ) : (
            // Show loading placeholder while filters are being set up
            <div className="grid grid-cols-1 md:grid-cols-7 w-full gap-4">
              {[...Array(7)].map((_, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 text-center min-h-[96px] flex flex-col items-center justify-center"
                >
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="animate-pulse bg-gray-200 h-7 w-12 rounded mb-1"></div>
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Components - only render when filters are ready */}
        {isFilterReady && timeFilter && (
          <>
            <div className='flex flex-row gap-2 mt-6'>
              <div className='w-1/2'>
                <LateEmployees timeFilter={timeFilter} floorFilter={floorFilter} />
              </div>
              <div className='w-1/2'>
                <NoClockOut timeFilter={timeFilter} floorFilter={floorFilter} />
              </div>
            </div>
            
            <div className="mt-6">
              <AttendanceDashboard timeFilter={timeFilter} floorFilter={floorFilter} />
            </div>
            
            <div className="mt-6">
              <AbsentDashboard2 timeFilter={timeFilter} floorFilter={floorFilter} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;