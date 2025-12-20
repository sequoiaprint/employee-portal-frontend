import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Stats from '../../../component/WorkForce/attendance/Stats';
import LateEmployees from '../../../component/WorkForce/attendance/LateEmployees';
import NoClockOut from '../../../component/WorkForce/attendance/NoClockOut';
import AttendanceDashboard from '../../../component/WorkForce/attendance/ProofCtpStats';
import AbsentDashboard2 from '../../../component/WorkForce/attendance/leaveStats';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'; // Or use your own icons

const Attendance = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [floorFilter, setFloorFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState(null);
  const [isFilterReady, setIsFilterReady] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const filterRef = useRef(null);

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
      setIsFilterReady(true);
    }
  }, [startDate, endDate]);

  // Handle end date change
  const handleEndDateChange = (date) => {
    if (date && startDate && date >= startDate) {
      setEndDate(date);
    } else if (date && date < startDate) {
      setEndDate(date);
      setStartDate(date);
    }
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    if (date && endDate && date <= endDate) {
      setStartDate(date);
    } else if (date && date > endDate) {
      setStartDate(date);
      setEndDate(date);
    }
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowMobileFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white shadow rounded-lg px-2 md:px-4 lg:px-6">
      <div className="px-1 md:px-4 py-5 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:gap-4 lg:justify-between mb-4 md:mb-6">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Attendance & Punctuality</h2>
            
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden lg:flex flex-row gap-4 items-start">
            <div>
              <div className="flex flex-row gap-2 items-center">
                <div className="flex flex-row gap-2 items-center w-40 xl:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={endDate}
                    dateFormat="MMM-dd"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    wrapperClassName="w-full"
                    popperClassName="z-50"
                    showPopperArrow={false}
                    popperPlacement="bottom-start"
                    popperStrategy="fixed"
                  />
                </div>
                <div className="flex flex-row gap-2 items-center w-40 xl:w-48">
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
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    wrapperClassName="w-full"
                    popperClassName="z-50"
                    popperPlacement="bottom-start"
                    popperStrategy="fixed"
                    showPopperArrow={false}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-40 xl:w-48"
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

          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden relative" ref={filterRef}>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center justify-between w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-4 py-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Filters</span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)} ({floorFilter})
                </span>
              </div>
              {showMobileFilters ? (
                <ChevronUp className="w-4 h-4 text-orange-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-orange-600" />
              )}
            </button>

            {/* Mobile Filter Dropdown */}
            {showMobileFilters && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                <div className="space-y-4">
                  {/* Date Range */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900">Date Range</h3>
                      <span className="text-xs text-gray-500">
                        {formatDateForDisplay(startDate)} - {formatDateForDisplay(endDate)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <DatePicker
                          selected={startDate}
                          onChange={handleStartDateChange}
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          maxDate={endDate}
                          dateFormat="MMM dd, yyyy"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          wrapperClassName="w-full"
                          popperClassName="z-50"
                          showPopperArrow={false}
                          popperPlacement="bottom"
                          popperStrategy="fixed"
                          calendarClassName="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <DatePicker
                          selected={endDate}
                          onChange={handleEndDateChange}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          minDate={startDate}
                          maxDate={new Date()}
                          dateFormat="MMM dd, yyyy"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          wrapperClassName="w-full"
                          popperClassName="z-50"
                          popperPlacement="bottom"
                          popperStrategy="fixed"
                          showPopperArrow={false}
                          calendarClassName="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Floor Filter */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900">Floor Selection</h3>
                    <select
                      value={floorFilter}
                      onChange={(e) => setFloorFilter(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
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

                  {/* Apply Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

       

        {/* Stats Section */}
        <div className='w-full'>
          {isFilterReady && timeFilter ? (
            <Stats timeFilter={timeFilter} floorFilter={floorFilter} />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 w-full gap-2 md:gap-4">
              {[...Array(7)].map((_, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 md:p-4 text-center min-h-[80px] md:min-h-[96px] flex flex-col items-center justify-center"
                >
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className="animate-pulse bg-gray-200 h-5 md:h-7 w-8 md:w-12 rounded mb-1"></div>
                    <div className="animate-pulse bg-gray-200 h-3 md:h-4 w-16 md:w-24 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Components - only render when filters are ready */}
        {isFilterReady && timeFilter && (
          <>
            {/* Late Employees & No Clock-Out */}
            <div className='flex flex-col lg:flex-row gap-4 lg:gap-6 mt-6'>
              <div className='w-full lg:w-1/2'>
                <LateEmployees timeFilter={timeFilter} floorFilter={floorFilter} />
              </div>
              <div className='w-full lg:w-1/2'>
                <NoClockOut timeFilter={timeFilter} floorFilter={floorFilter} />
              </div>
            </div>

            {/* Attendance Dashboard */}
            <div className="mt-6">
              <AttendanceDashboard timeFilter={timeFilter} floorFilter={floorFilter} />
            </div>

            {/* Absent Dashboard */}
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