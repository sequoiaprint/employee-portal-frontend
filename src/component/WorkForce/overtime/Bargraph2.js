import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingUp, Clock, Briefcase, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TopJobTitlesOvertimeChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  // Set default date range to last 7 days
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date();
  });

  // Format date for API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display
  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const timeFilter = `${formatDateForAPI(startDate)}_to_${formatDateForAPI(endDate)}`;
        const response = await fetch(`https://attendance.sequoia-print.com/api/overtimeRouter/top-overtime/${timeFilter}`);
        const result = await response.json();

        if (result.success) {
          const formattedData = result.data.map(item => ({
            ...item,
            total_overtime: Number(item.total_overtime.toFixed(2)),
            shortTitle: item.jobtitle.length > 20
              ? `${item.jobtitle.substring(0, 20)}...`
              : item.jobtitle,
            displayHours: Math.round(item.total_overtime)
          }));
          setData(formattedData);
        } else {
          setError(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error fetching data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
   
  }, [startDate, endDate]);

  // Custom label component
  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#374151"
        textAnchor="middle"
        fontSize={12}
        fontWeight="bold"
      >
        {Math.round(value)}h
      </text>
    );
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 h-80 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 h-80 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-red-500 mb-2"> {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 h-80 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No overtime data available for the selected date range</p>
        </div>
      </div>
    );
  }

  const maxEntry = data.reduce((max, item) =>
    item.total_overtime > max.total_overtime ? item : max
    , data[0]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold flex flex-row gap-2 items-center text-gray-800">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Top Job Titles by Overtime (All Floors)
        </h3>
       
      </div>

      {/* Stats + Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4 items-start">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-3">
          <div className="bg-green-50 p-2 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Peak Hours</p>
            <p className="text-xl font-bold">{Math.round(maxEntry.total_overtime)} hrs</p>
          </div>

          <div className="bg-purple-50 p-2 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Top Overtime</p>
            <p className="text-sm font-bold">
              {maxEntry.jobtitle} ({Math.round(maxEntry.total_overtime)} hrs)
            </p>
          </div>

          <div className="bg-orange-50 p-2 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Total Hours</p>
            <p className="text-xl font-bold">
              {Math.round(data.reduce((sum, item) => sum + item.total_overtime, 0))} hrs
            </p>
          </div>
        </div>

        {/* Date Filter with DatePicker */}
        <div className="col-span-2 bg-white p-4 rounded-lg border flex flex-col sm:flex-row gap-6 items-start">
          {/* Start Date */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="flex items-center gap-2">
              
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                dateFormat="MMM-dd"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                wrapperClassName="w-full"
                popperClassName="z-50"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="flex items-center gap-2">
              
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                dateFormat="MMM-dd"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                wrapperClassName="w-full"
                popperClassName="z-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 30, right: 30, left: 0, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="shortTitle"
              angle={0}
              textAnchor="middle"
              height={50}
              tick={{ fontSize: 13, fill: '#333', fontWeight: 'bold' }}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#666' }}
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fontSize: 12, fill: '#666' }
              }}
            />
            <Area
              type="monotone"
              dataKey="total_overtime"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorGradient)"
              dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 4 }}
            >
              <LabelList 
                dataKey="total_overtime" 
                position="top" 
                content={renderCustomizedLabel}
              />
            </Area>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='text-gray-500 mt-auto p-4 space-y-2 bg-gray-50 rounded-b-lg border'>
        Role wise overtime sumation = Σ (Gross Hours - Regular Shift(Regular In Time - Regular End Time))
      </div>
    </div>
  );
};

export default TopJobTitlesOvertimeChart;