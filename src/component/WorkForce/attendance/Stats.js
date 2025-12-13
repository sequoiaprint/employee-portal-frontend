import React, { useState, useEffect } from 'react';
import ListEmp from './ListEmp';
import TotalEmployeesModal from './Popup/TotalEmployeesModal';
import PresentEmployeesModal from './Popup/PresentEmployeesModal';
import AbsentEmployeesModal from './Popup/AbsentEmployeesModal';
import OnTimeEmployeesModal from './Popup/OnTimeEmployeesModal';
import LateEmployeesModal from './Popup/LateEmployeesModal';
import MostOnTimeModal from './Popup/MostOnTimeModal';
import MostLateModal from './Popup/MostLateModal';
import NoClockOutModal from './Popup/NoClockOutModal';

const Stats = ({ timeFilter = 'this week', floorFilter = 'all' }) => {
  const [stats, setStats] = useState(null);
  const [mostOnTime, setMostOnTime] = useState(null);
  const [mostLate, setMostLate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostLoading, setMostLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noClockOutEmployees, setNoClockOutEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  // Separate modal states for each card
  const [showTotalModal, setShowTotalModal] = useState(false);
  const [showPresentModal, setShowPresentModal] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [showOnTimeModal, setShowOnTimeModal] = useState(false);
  const [showLateModal, setShowLateModal] = useState(false);
  const [showMostOnTimeModal, setShowMostOnTimeModal] = useState(false);
  const [showMostLateModal, setShowMostLateModal] = useState(false);
  const [showNoClockOutModal, setShowNoClockOutModal] = useState(false);

  // Function to check if timeFilter is "today" or "yesterday" based on date range
  const isTodayOrYesterday = () => {
    if (!timeFilter.includes('_to_')) {
      return timeFilter === 'today' || timeFilter === 'yesterday';
    }
    
    // Check if the date range is for today or yesterday
    try {
      const dateParts = timeFilter.split('_to_');
      if (dateParts.length === 2) {
        const startDate = new Date(dateParts[0]);
        const endDate = new Date(dateParts[1]);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if both dates are the same (single day)
        if (startDate.toDateString() === endDate.toDateString()) {
          // Check if it's today
          if (startDate.toDateString() === today.toDateString()) {
            return 'today';
          }
          // Check if it's yesterday
          if (startDate.toDateString() === yesterday.toDateString()) {
            return 'yesterday';
          }
        }
      }
    } catch (error) {
      console.error('Error parsing date range:', error);
    }
    
    return false;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://attendance.sequoia-print.com/api/dashboard/stats?floor=${floorFilter}&timeFilter=${timeFilter}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately when component mounts or filters change
    fetchStats();

    // Set up interval to refresh every 10 minutes (600,000 milliseconds)
    const intervalId = setInterval(fetchStats, 600000);

    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [timeFilter, floorFilter]);

  useEffect(() => {
    const fetchMostEmployees = async () => {
      try {
        setMostLoading(true);

        // Fetch both most on-time and most late employees in parallel
        const [onTimeResponse, lateResponse] = await Promise.all([
          fetch(`https://attendance.sequoia-print.com/api/dashboard/most-on-time?floor=${floorFilter}&timeFilter=${timeFilter}`),
          fetch(`https://attendance.sequoia-print.com/api/dashboard/most-late?floor=${floorFilter}&timeFilter=${timeFilter}`)
        ]);

        if (!onTimeResponse.ok || !lateResponse.ok) {
          throw new Error('Failed to fetch most employees data');
        }

        const onTimeData = await onTimeResponse.json();
        const lateData = await lateResponse.json();

        if (onTimeData.success) {
          setMostOnTime(onTimeData);
        }

        if (lateData.success) {
          setMostLate(lateData);
        }
      } catch (err) {
        console.error('Error fetching most employees:', err);
      } finally {
        setMostLoading(false);
      }
    };

    fetchMostEmployees();
  }, [timeFilter, floorFilter]);

  useEffect(() => {
    const fetchNoClockOutEmployees = async () => {
      try {
        // Don't set loading to true here, we already have a loading state
        const response = await fetch(
          `https://attendance.sequoia-print.com/api/dashboard/no-clock-out?floor=${floorFilter}&timeFilter=${timeFilter}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch no clock-out employees data');
        }
        
        const result = await response.json();
        
        // Check if the API response has the expected structure
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid data format from API');
        }
        
        setNoClockOutEmployees(result.data);
        setTotalCount(result.data.length);
        setError(null);
      } catch (err) {
        console.error('Error fetching no clock-out employees:', err);
        setNoClockOutEmployees([]);
        setTotalCount(0);
      }
    };
  
    // Fetch immediately when component mounts or filters change
    fetchNoClockOutEmployees();
  
    // Set up interval to refresh every 10 minutes (600,000 milliseconds)
    const intervalId = setInterval(fetchNoClockOutEmployees, 600000);
  
    // Cleanup function to clear interval when component unmounts or dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [timeFilter, floorFilter]);

  // Function to display employee names with count
  const displayEmployeeNames = (data) => {
    if (!data || !data.data || data.data.length === 0) {
      return 'No data';
    }

    return data.data.map(emp => `${emp.name}`).join(', ');
  };

  // Function to display no clock-out employees
  const displayNoClockOutNames = () => {
    if (!noClockOutEmployees || noClockOutEmployees.length === 0) {
      return 'No employees';
    }

    return noClockOutEmployees.slice(0, 3).map(emp => emp.name).join(', ');
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  const showCount = isTodayOrYesterday();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-7 w-full gap-4 mb-6">
        {/* Total Employees Card */}
        <div
          className="bg-gradient-to-br from-[#04b6b0] via-[#03726e] to-[#016461] flex flex-col items-center justify-center border-blue-200 rounded-lg p-4 text-center cursor-pointer hover:bg-[#07817d] transition-colors min-h-[96px]"
          onClick={() => !loading && stats && setShowTotalModal(true)}
        >
          {loading || !stats ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="animate-pulse bg-white/30 h-7 w-12 rounded mb-1"></div>
              <div className="animate-pulse bg-white/30 h-4 w-24 rounded"></div>
            </div>
          ) : (
            <div className='p-2 rounded-lg w-full'>
              <div className="text-white text-3xl mb-4 font-bold">Total Employees</div>
              <div className="text-3xl font-bold text-white">{stats.total_employees}</div>
            </div>
          )}
        </div>

        {/* Present Count Card */}
        <div
          className="bg-gradient-to-br from-yellow-200 via-orange-400 to-orange-500 border flex flex-col items-center justify-center border-green-200 rounded-lg p-4 text-center cursor-pointer hover:bg-orange-400 transition-colors min-h-[96px]"
          onClick={() => !loading && stats && setShowPresentModal(true)}
        >
          {loading || !stats ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="animate-pulse bg-white/30 h-7 w-12 rounded mb-1"></div>
              <div className="animate-pulse bg-white/30 h-4 w-16 rounded mb-1"></div>
              <div className="animate-pulse bg-white/30 h-5 w-16 rounded"></div>
            </div>
          ) : (
            <div className="p-2 rounded-lg w-full">
              <div className="text-white text-3xl mb-4 font-bold">Present</div>
              {showCount && (
                <div className="text-3xl font-bold text-white mb-2">{stats.present_count}</div>
              )}
              <div className="text-white text-[18px] font-bold">
                {stats.present_percentage.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Absent Count Card */}
        <div
          className="bg-gradient-to-br from-blue-600 via-[#009b97] to-[#009b97] border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#00948f] transition-colors min-h-[96px]"
          onClick={() => !loading && stats && setShowAbsentModal(true)}
        >
          {loading || !stats ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="animate-pulse bg-white/30 h-7 w-12 rounded mb-1"></div>
              <div className="animate-pulse bg-white/30 h-4 w-16 rounded mb-1"></div>
              <div className="animate-pulse bg-white/30 h-5 w-16 rounded"></div>
            </div>
          ) : (
            <div className='p-2 rounded-lg w-full'>
              <div className="text-white text-3xl mb-4 font-bold">Absent</div>
              {showCount && (
                <div className="text-3xl font-bold text-white mb-2">{stats.absent_count}</div>
              )}
              <div className="text-white text-[18px] font-bold">
                {stats.absent_percentage.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* On Time & Late Card */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 border text-white border-purple-200 rounded-lg p-4 flex items-center flex-col justify-center min-h-[96px]">
          {loading || !stats ? (
            <div className="flex flex-col h-full justify-center">
              <div className="animate-pulse bg-white/30 h-5 w-24 rounded mx-auto mb-3"></div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <div className="animate-pulse bg-white/30 h-7 w-12 rounded mb-1"></div>
                  <div className="animate-pulse bg-white/30 h-4 w-16 rounded mb-1"></div>
                  <div className="animate-pulse bg-white/30 h-5 w-12 rounded"></div>
                </div>
                <div className="h-8 w-px bg-purple-200"></div>
                <div className="flex flex-col items-center">
                  <div className="animate-pulse bg-white/30 h-7 w-12 rounded mb-1"></div>
                  <div className="animate-pulse bg-white/30 h-4 w-16 rounded mb-1"></div>
                  <div className="animate-pulse bg-white/30 h-5 w-12 rounded"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-3">
                <div className="text-3xl font-bold">Punctuality</div>
              </div>
              <div className="flex flex-row justify-between items-center">
                <div
                  className="text-center cursor-pointer hover:bg-purple-600 rounded p-2 transition-colors flex flex-col items-center"
                  onClick={() => setShowOnTimeModal(true)}
                >
                  <div className="text-xl font-bold">On Time</div>
                  {showCount && (
                    <div className="text-3xl font-bold mt-2">{stats.on_time_count}</div>
                  )}
                  <div className="text-[18px] font-medium mt-1">
                    {stats.on_time_percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="h-12 w-px bg-purple-200"></div>
                <div
                  className="text-center cursor-pointer hover:bg-purple-600 rounded p-2 transition-colors flex flex-col items-center"
                  onClick={() => setShowLateModal(true)}
                >
                  <div className="text-xl font-bold">Late</div>
                  {showCount && (
                    <div className="text-3xl font-bold mt-2">{stats.late_count}</div>
                  )}
                  <div className="text-[18px] font-medium mt-1">
                    {stats.late_percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Most On-Time Employee Card */}
        <div
          className="bg-gradient-to-br from-[#04b6b0] via-[#03726e] to-[#016461] border border-emerald-200 rounded-lg p-4 text-center cursor-pointer text-white hover:bg-[#07817d] transition-colors min-h-[96px]"
          onClick={() => !mostLoading && setShowMostOnTimeModal(true)}
        >
          {mostLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-pulse bg-white/30 h-5 w-32 rounded mb-3"></div>
              <div className="animate-pulse bg-white/30 h-4 w-full rounded mb-2"></div>
              <div className="animate-pulse bg-white/30 h-4 w-16 rounded"></div>
            </div>
          ) : (
            <div className='p-2 rounded-lg w-full'>
              <div className="text-3xl font-bold mb-4">🏆 Most On-Time</div>
              <div className="text-lg font-medium line-clamp-2 mb-2">
                {displayEmployeeNames(mostOnTime)}
              </div>
              {mostOnTime?.max_count > 0 && (
                <div className="text-[18px] font-bold">
                  {mostOnTime.max_count} days
                </div>
              )}
            </div>
          )}
        </div>

        {/* Most Late Employee Card */}
        <div
          className="bg-gradient-to-br from-yellow-500 via-orange-400 to-orange-500 border border-amber-200 rounded-lg p-4 text-center cursor-pointer text-white hover:bg-orange-400 transition-colors min-h-[96px]"
          onClick={() => !mostLoading && setShowMostLateModal(true)}
        >
          {mostLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-pulse bg-white/30 h-5 w-28 rounded mb-3"></div>
              <div className="animate-pulse bg-white/30 h-4 w-full rounded mb-2"></div>
              <div className="animate-pulse bg-white/30 h-4 w-16 rounded"></div>
            </div>
          ) : (
            <div className='p-2 rounded-lg w-full'>
              <div className="text-3xl font-bold mb-4">Most Late</div>
              <div className="text-lg font-medium line-clamp-2 mb-2">
                {displayEmployeeNames(mostLate)}
              </div>
              {mostLate?.max_count > 0 && (
                <div className="text-[18px] font-bold">
                  {mostLate.max_count} days
                </div>
              )}
            </div>
          )}
        </div>

        {/* No Clock-Outs Card */}
        <div
          className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 border border-red-300 rounded-lg p-4 text-center cursor-pointer text-white hover:bg-red-600 transition-colors min-h-[96px]"
          onClick={() => {!mostLoading && setShowNoClockOutModal(true)}}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-pulse bg-white/30 h-5 w-28 rounded mb-3"></div>
              <div className="animate-pulse bg-white/30 h-4 w-full rounded mb-2"></div>
              <div className="animate-pulse bg-white/30 h-4 w-16 rounded"></div>
            </div>
          ) : (
            <div className='p-2 rounded-lg w-full'>
              <div className="text-3xl font-bold mb-4">No Clock-Outs</div>
              <div className="text-lg font-medium line-clamp-2 mb-2 min-h-[40px]">
                {displayNoClockOutNames()}
              </div>
              {totalCount > 0 && (
                <div className="text-[18px] font-bold">
                  {totalCount} employee{totalCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <TotalEmployeesModal
        isOpen={showTotalModal}
        onClose={() => setShowTotalModal(false)}
        floorFilter={floorFilter}
      />

      <PresentEmployeesModal
        isOpen={showPresentModal}
        onClose={() => setShowPresentModal(false)}
        timeFilter={timeFilter}
        floorFilter={floorFilter}
      />

      <AbsentEmployeesModal
        isOpen={showAbsentModal}
        onClose={() => setShowAbsentModal(false)}
        timeFilter={timeFilter}
        floorFilter={floorFilter}
      />

      <OnTimeEmployeesModal
        isOpen={showOnTimeModal}
        onClose={() => setShowOnTimeModal(false)}
        timeFilter={timeFilter}
        floorFilter={floorFilter}
      />

      <LateEmployeesModal
        isOpen={showLateModal}
        onClose={() => setShowLateModal(false)}
        timeFilter={timeFilter}
        floorFilter={floorFilter}
      />

      <MostOnTimeModal
        isOpen={showMostOnTimeModal}
        onClose={() => setShowMostOnTimeModal(false)}
        timeFilter={timeFilter}
        floorFilter={floorFilter}
      />

      <MostLateModal
        isOpen={showMostLateModal}
        onClose={() => setShowMostLateModal(false)}
        timeFilter={timeFilter}
        floorFilter={floorFilter}
      />
      <NoClockOutModal
        isOpen={showNoClockOutModal}
        onClose={() => setShowNoClockOutModal(false)}
        timeFilter={timeFilter}
        floorFilter={floorFilter}
      />
    </>
  );
};

export default Stats;