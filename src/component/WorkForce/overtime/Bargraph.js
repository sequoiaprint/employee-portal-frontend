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
import { BarChart3, TrendingUp, RefreshCw } from 'lucide-react';

const WeeklyOvertimeSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('');

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-md p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading overtime data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-md p-6">
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
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Weekly Overtime Summary (Ground & 1st Floor)</h2>
              <p className="text-gray-600">Total overtime hours by day [Date Range : {dateRange}]</p>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
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

        {/* Chart Container */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                tick={{ fill: '#6b7280', fontSize: 14 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 14 }}
                label={{
                  value: 'Hours',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -10,
                  style: { textAnchor: 'middle', fill: '#6b7280' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Bar for total hours */}
              <Bar
                dataKey="hours"
                name="hours"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={60}
              />

              {/* Line for trend visualization */}
              <Line
                type="monotone"
                dataKey="hours"
                name="trend"
                stroke="#10b981"
                strokeWidth={3}
                dot={{
                  stroke: '#10b981',
                  strokeWidth: 2,
                  r: 4,
                  fill: 'white'
                }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className='text-gray-500 mt-auto p-4 space-y-2 bg-gray-50 rounded-b-lg border'>
          All Employees Overtime sumation = Σ (Gross Hours - Regular Shift(Regular In Time - Regular End Time))
        </div>
      </div>
    </div>
  );
};

export default WeeklyOvertimeSummary;