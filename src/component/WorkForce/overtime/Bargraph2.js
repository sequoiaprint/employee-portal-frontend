import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import { TrendingUp, Clock, Briefcase, Calendar, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TopJobTitlesOvertimeChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('desktop');
  const [showFilters, setShowFilters] = useState(false);

  // Set default date range to last 7 days
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date();
  });

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

  // Mobile stats cards
  const renderMobileStats = () => {
    const maxEntry = data.length > 0 ? data.reduce((max, item) =>
      item.total_overtime > max.total_overtime ? item : max
      , data[0]) : null;

    const totalHours = data.reduce((sum, item) => sum + item.total_overtime, 0);

    const stats = [
      {
        title: "Peak Hours",
        value: maxEntry ? `${Math.round(maxEntry.total_overtime)} hrs` : '0 hrs',
        color: "bg-green-50",
        textColor: "text-green-600",
        icon: <Clock className="w-3 h-3" />
      },
      {
        title: "Total Hours",
        value: `${Math.round(totalHours)} hrs`,
        color: "bg-orange-50",
        textColor: "text-orange-600",
        icon: <TrendingUp className="w-3 h-3" />
      }
    ];

    return (
      <div className="grid grid-cols-2 gap-2 mb-3">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} p-2 rounded-lg`}>
            <div className="flex items-center gap-1 mb-0.5">
              {stat.icon}
              <p className={`text-xs ${stat.textColor} font-medium`}>{stat.title}</p>
            </div>
            <p className="text-base font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // Tablet stats cards
  const renderTabletStats = () => {
    const maxEntry = data.length > 0 ? data.reduce((max, item) =>
      item.total_overtime > max.total_overtime ? item : max
      , data[0]) : null;

    const totalHours = data.reduce((sum, item) => sum + item.total_overtime, 0);

    const stats = [
      {
        title: "Peak Hours",
        value: maxEntry ? `${Math.round(maxEntry.total_overtime)} hrs` : '0 hrs',
        color: "bg-green-50",
        textColor: "text-green-600"
      },
      {
        title: "Top Overtime",
        value: maxEntry ? `${maxEntry.jobtitle.substring(0, 15)}${maxEntry.jobtitle.length > 15 ? '...' : ''}` : 'N/A',
        color: "bg-purple-50",
        textColor: "text-purple-600"
      },
      {
        title: "Total Hours",
        value: `${Math.round(totalHours)} hrs`,
        color: "bg-orange-50",
        textColor: "text-orange-600"
      }
    ];

    return (
      <div className="grid grid-cols-3 gap-2 mb-3">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.color} p-2 rounded-lg`}>
            <p className={`text-xs ${stat.textColor} font-medium`}>{stat.title}</p>
            <p className="text-sm font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // Desktop stats (original layout)
  const renderDesktopStats = () => {
    const maxEntry = data.length > 0 ? data.reduce((max, item) =>
      item.total_overtime > max.total_overtime ? item : max
      , data[0]) : null;

    return (
      <div className="grid grid-cols-2 md:flex md:flex-row gap-4 col-span-3">
        <div className="bg-green-50 p-2 rounded-lg flex-1">
          <p className="text-sm text-green-600 font-medium">Peak Hours</p>
          <p className="text-xl font-bold">{maxEntry ? Math.round(maxEntry.total_overtime) : 0} hrs</p>
        </div>

        <div className="bg-purple-50 p-2 rounded-lg flex-1">
          <p className="text-sm text-purple-600 font-medium">Top Overtime</p>
          <p className="text-[13px] font-bold">
            {maxEntry ? `${maxEntry.jobtitle} (${Math.round(maxEntry.total_overtime)} hrs)` : 'N/A'}
          </p>
        </div>

        <div className="bg-orange-50 p-2 rounded-lg flex-1">
          <p className="text-sm text-orange-600 font-medium">Total Hours</p>
          <p className="text-xl font-bold">
            {Math.round(data.reduce((sum, item) => sum + item.total_overtime, 0))} hrs
          </p>
        </div>
      </div>
    );
  };

  // Mobile/Tablet date filters (toggle dropdown)
  const renderMobileTabletFilters = () => {
    return (
      <div className="mb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full text-left mb-1 bg-gray-50 p-2 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">
              Date Filters
            </h3>
          </div>
          {showFilters ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {showFilters && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <div className="flex items-center gap-2">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={endDate}
                    dateFormat="MMM-dd"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    wrapperClassName="w-full"
                    popperClassName="z-50"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-700 mb-1">End Date</label>
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
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    wrapperClassName="w-full"
                    popperClassName="z-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Desktop date filters (original layout)
  const renderDesktopFilters = () => {
    return (
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
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold flex flex-row gap-2 items-center text-gray-800">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          Top Job Titles by Overtime (All Floors)
        </h3>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {currentView === 'mobile' && (
          <>
            {renderMobileStats()}
            {renderMobileTabletFilters()}
            
            {/* Chart for Mobile */}
            <div className="h-[220px] mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 30, right: 10, left: 0, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortTitle"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 11, fill: '#333', fontWeight: 'bold' }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#666' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_overtime"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorGradient)"
                    dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 3 }}
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
          </>
        )}
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden">
        {currentView === 'tablet' && (
          <>
            {renderTabletStats()}
            {renderMobileTabletFilters()}
            
            {/* Chart for Tablet */}
            <div className="h-[240px] mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 30, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="shortTitle"
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12, fill: '#333', fontWeight: 'bold' }}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#666' }}
                    label={{
                      value: 'Hours',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 5,
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
          </>
        )}
      </div>

      {/* Desktop View - Original Layout */}
      <div className="hidden lg:block">
        {/* Stats + Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4 items-start">
          {renderDesktopStats()}
          {renderDesktopFilters()}
        </div>

        {/* Chart for Desktop */}
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
      </div>

      {/* Footer Note */}
      <div className='text-gray-500 mt-2 p-2 space-y-1 bg-gray-50 rounded-lg border text-xs md:text-sm'>
        Role wise overtime sumation = Σ (Gross Hours - Regular Shift(Regular In Time - Regular End Time))
      </div>
    </div>
  );
};

export default TopJobTitlesOvertimeChart;