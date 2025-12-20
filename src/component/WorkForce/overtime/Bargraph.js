import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const WeeklyOvertimeSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('');
  const [currentView, setCurrentView] = useState('desktop');
  const [expandedStats, setExpandedStats] = useState(false);
  const [expandedChart, setExpandedChart] = useState(false);

  // Check screen size and update view
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setCurrentView('mobile');
      } else if (window.innerWidth < 1024) {
        setCurrentView('tablet');
      } else {
        setCurrentView('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Function to calculate and format the date range
  const getDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Format dates (e.g., "Nov 2, 2023 - Dec 2, 2023")
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    return `${formatDate(thirtyDaysAgo)} - ${formatDate(today)}`;
  };

  const fetchWeeklySummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://attendance.sequoia-print.com/api/overtimeRouter/weekly-summary');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Transform the API response to Recharts format
      const chartData = Object.entries(result).map(([day, dayData]) => ({
        name: day,
        hours: dayData.total_hours,
        displayHours: Math.round(dayData.total_hours * 100) / 100
      }));

      // Filter out the _cache entry if present
      const filteredData = chartData.filter(item => item.name !== '_cache');
      
      setData(filteredData);
      setDateRange(getDateRange()); // Set the date range
      setError(null);
    } catch (err) {
      setError('Failed to fetch overtime data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklySummary();
  }, []);

  // Helper functions to calculate stats safely
  const calculateMonthlyTotal = () => {
    if (!data.length) return 0;
    return Math.round(data.reduce((sum, day) => sum + day.hours, 0));
  };

  const getPeakOTDay = () => {
    if (!data.length) return '--';
    const peakDay = data.reduce((max, day) => day.hours > max.hours ? day : max, data[0]);
    return peakDay?.name || '--';
  };

  const getPeakOTHours = () => {
    if (!data.length) return 0;
    return Math.round(Math.max(...data.map(day => day.hours)));
  };

  const calculateWeeklyAverage = () => {
    if (!data.length) return 0;
    const total = data.reduce((sum, day) => sum + day.hours, 0);
    return Math.round(total / 4.2857);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-lg rounded-lg">
          <p className="text-blue-600">
            Hours: <span className="font-bold">{Math.round(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Mobile stats card
  const renderMobileStats = () => {
    const stats = [
      {
        title: "Monthly Total OT (30days)",
        value: `${calculateMonthlyTotal()} hrs`,
        color: "bg-blue-50",
        textColor: "text-blue-600"
      },
      {
        title: "Peak OT Day",
        value: getPeakOTDay(),
        color: "bg-green-50",
        textColor: "text-green-600"
      },
      {
        title: "Peak OT Hours",
        value: `${getPeakOTHours()} hrs`,
        color: "bg-purple-50",
        textColor: "text-purple-600"
      },
      {
        title: "Weekly OT Average",
        value: `${calculateWeeklyAverage()} hrs`,
        color: "bg-orange-50",
        textColor: "text-orange-600"
      }
    ];

    return (
      <div className="mb-3">
        <button
          onClick={() => setExpandedStats(!expandedStats)}
          className="flex items-center justify-between w-full text-left mb-1"
        >
          <h3 className="text-base font-semibold text-gray-700">
            Overtime Statistics
          </h3>
          {expandedStats ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {expandedStats && (
          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.color} p-2 rounded-lg`}>
                <p className={`text-xs ${stat.textColor} font-medium`}>{stat.title}</p>
                <p className="text-base font-bold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Tablet stats view
  const renderTabletStats = () => {
    const stats = [
      {
        title: "Monthly Total",
        value: `${calculateMonthlyTotal()} hrs`,
        color: "bg-blue-50",
        textColor: "text-blue-600"
      },
      {
        title: "Peak Day",
        value: getPeakOTDay(),
        color: "bg-green-50",
        textColor: "text-green-600"
      },
      {
        title: "Peak Hours",
        value: `${getPeakOTHours()} hrs`,
        color: "bg-purple-50",
        textColor: "text-purple-600"
      },
      {
        title: "Weekly Avg",
        value: `${calculateWeeklyAverage()} hrs`,
        color: "bg-orange-50",
        textColor: "text-orange-600"
      }
    ];

    return (
      <div className="grid grid-cols-4 gap-2 mb-3">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} p-2 rounded-lg`}>
            <p className={`text-xs ${stat.textColor} font-medium`}>{stat.title}</p>
            <p className="text-sm font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // Desktop stats view (original)
  const renderDesktopStats = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <div className="bg-blue-50 p-2 rounded-xl">
          <p className="text-sm text-blue-600 font-medium">Monthly Total OT (30days)</p>
          <p className="text-lg font-bold text-gray-800">
            {calculateMonthlyTotal()} hrs
          </p>
        </div>

        <div className="bg-green-50 p-2 rounded-xl">
          <p className="text-sm text-green-600 font-medium">Peak OT Day</p>
          <p className="text-lg font-bold text-gray-800">
            {getPeakOTDay()}
          </p>
        </div>

        <div className="bg-purple-50 p-2 rounded-xl">
          <p className="text-sm text-purple-600 font-medium">Peak OT Hours</p>
          <p className="text-lg font-bold text-gray-800">
            {getPeakOTHours()} hrs
          </p>
        </div>

        <div className="bg-orange-50 p-2 rounded-xl">
          <p className="text-sm text-orange-600 font-medium">Weekly OT Average</p>
          <p className="text-lg font-bold text-gray-800">
            {calculateWeeklyAverage()} hrs
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-md p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading overtime data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-md p-4">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={fetchWeeklySummary}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-lg p-4">
        {/* Header - Responsive */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                Weekly Overtime Summary (Ground & 1st Floor)
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                Total overtime hours by day [Date Range: {dateRange}]
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary - Responsive */}
        {currentView === 'mobile' && renderMobileStats()}
        {currentView === 'tablet' && renderTabletStats()}
        {currentView === 'desktop' && renderDesktopStats()}

        {/* Chart Container - Responsive */}
        {currentView === 'mobile' && (
          <div className="mb-3">
            <button
              onClick={() => setExpandedChart(!expandedChart)}
              className="flex items-center justify-between w-full text-left mb-1"
            >
              <h3 className="text-base font-semibold text-gray-700">
                Overtime Chart
              </h3>
              {expandedChart ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            
            {expandedChart && (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Bar for total hours */}
                    <Bar
                      dataKey="hours"
                      name="hours"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />

                    {/* Line for trend visualization */}
                    <Line
                      type="monotone"
                      dataKey="hours"
                      name="trend"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{
                        stroke: '#10b981',
                        strokeWidth: 2,
                        r: 3,
                        fill: 'white'
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Chart for Tablet and Desktop */}
        {(currentView === 'tablet' || currentView === 'desktop') && (
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ 
                  top: 10, 
                  right: currentView === 'tablet' ? 10 : 30, 
                  left: currentView === 'tablet' ? 0 : 20, 
                  bottom: currentView === 'tablet' ? 20 : 20 
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fill: '#6b7280', 
                    fontSize: currentView === 'tablet' ? 12 : 14 
                  }}
                  angle={currentView === 'tablet' ? -45 : 0}
                  textAnchor={currentView === 'tablet' ? "end" : "middle"}
                  height={currentView === 'tablet' ? 50 : 20}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fill: '#6b7280', 
                    fontSize: currentView === 'tablet' ? 12 : 14 
                  }}
                  label={currentView === 'desktop' ? {
                    value: 'Hours',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -10,
                    style: { textAnchor: 'middle', fill: '#6b7280' }
                  } : null}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Bar for total hours */}
                <Bar
                  dataKey="hours"
                  name="hours"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={currentView === 'tablet' ? 40 : 60}
                />

                {/* Line for trend visualization */}
                <Line
                  type="monotone"
                  dataKey="hours"
                  name="trend"
                  stroke="#10b981"
                  strokeWidth={currentView === 'tablet' ? 2 : 3}
                  dot={{
                    stroke: '#10b981',
                    strokeWidth: currentView === 'tablet' ? 2 : 2,
                    r: currentView === 'tablet' ? 3 : 4,
                    fill: 'white'
                  }}
                  activeDot={{ r: currentView === 'tablet' ? 5 : 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Footer Note */}
        <div className='text-gray-500 mt-2 p-2 space-y-1 bg-gray-50 rounded-lg border text-xs md:text-sm'>
          All Employees Overtime sumation = Σ (Gross Hours - Regular Shift(Regular In Time - Regular End Time))
        </div>
      </div>
    </div>
  );
};

export default WeeklyOvertimeSummary;