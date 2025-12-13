import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Label
} from 'recharts';
import {
  TrendingDown, TrendingUp, AlertCircle,
  RefreshCw, Calendar
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_BASE_URL = 'https://attendance.sequoia-print.com/api/utilization';

const MachineUtilizationAnalysis = () => {
  const [weekData, setWeekData] = useState({
    'This Week': {},
    'Last Week': {},
    'Two Weeks Ago': {}
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState('KOMORI');
  const [selectedMachineFilter, setSelectedMachineFilter] = useState('All');

  // Custom date range states for 2nd table
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [customData, setCustomData] = useState({});
  const [loadingCustom, setLoadingCustom] = useState(false);

  const validMachines = ['KOMORI', 'RYOBI2', 'RYOBI 3'];
  const weeks = ['This Week', 'Last Week', 'Two Weeks Ago'];

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date to "Dec-12" format
  const formatDateDisplay = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month}-${day}`;
  };

  // Calculate number of days between two dates
  const calculateDaysDuration = (start, end) => {
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Fetch custom date range data for 2nd table
  const fetchCustomDateRangeData = async (start, end) => {
    if (!start || !end) return;

    setLoadingCustom(true);
    const formattedStartDate = formatDateForAPI(start);
    const formattedEndDate = formatDateForAPI(end);
    const timeFilter = `${formattedStartDate}_to_${formattedEndDate}`;

    try {
      const promises = validMachines.map(machine =>
        axios.get(`${API_BASE_URL}/${machine}/${timeFilter}`)
          .then(response => ({ machine, data: response.data }))
          .catch(err => {
            console.error(`Error fetching ${machine} - custom range:`, err);
            return { machine, data: null };
          })
      );

      const responses = await Promise.all(promises);
      const newCustomData = {};

      responses.forEach(({ machine, data }) => {
        if (data) {
          newCustomData[machine] = data;
        } else {
          newCustomData[machine] = { employees: [] };
        }
      });

      setCustomData(newCustomData);
    } catch (err) {
      console.error('Error fetching custom date range data:', err);
    } finally {
      setLoadingCustom(false);
    }
  };

  // Fetch all data for all machines and all weeks (for 1st table)
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = [];
      weeks.forEach(week => {
        validMachines.forEach(machine => {
          promises.push(
            axios.get(`${API_BASE_URL}/${machine}/${week}`)
              .then(response => ({ machine, week, data: response.data }))
              .catch(err => {
                console.error(`Error fetching ${machine} - ${week}:`, err);
                return { machine, week, data: null };
              })
          );
        });
      });

      const responses = await Promise.all(promises);

      const newWeekData = {
        'This Week': {},
        'Last Week': {},
        'Two Weeks Ago': {}
      };

      responses.forEach(({ machine, week, data }) => {
        if (data) {
          newWeekData[week][machine] = data;
        } else {
          newWeekData[week][machine] = { employees: [] };
        }
      });

      setWeekData(newWeekData);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate machine statistics for each week (for 1st table)
  const getMachineWeeklyStats = () => {
    const machineStats = [];

    validMachines.forEach(machine => {
      const machineData = {
        machine: machine,
        weeks: {}
      };

      weeks.forEach(week => {
        const data = weekData[week][machine];
        if (data && data.employees) {
          const employees = data.employees || [];
          const avgUtilization = employees.length > 0
            ? employees.reduce((sum, emp) => sum + (emp.utilization_percentage || 0), 0) / employees.length
            : 0;

          machineData.weeks[week] = {
            avgUtilization: avgUtilization,
            totalEmployees: employees.length,
            belowThreshold: employees.filter(emp => (emp.utilization_percentage || 0) < 80).length,
            aboveThreshold: employees.filter(emp => (emp.utilization_percentage || 0) >= 80).length,
            totalProductionHours: (data.total_production_time_minutes || 0) / 60,
            employees: employees
          };
        } else {
          machineData.weeks[week] = {
            avgUtilization: 0,
            totalEmployees: 0,
            belowThreshold: 0,
            aboveThreshold: 0,
            totalProductionHours: 0,
            employees: []
          };
        }
      });

      // Calculate if machine is consistently below 80%
      const weekValues = Object.values(machineData.weeks);
      machineData.isBelowThreshold = weekValues.length === 3 &&
        weekValues.every(w => w.avgUtilization < 80);

      // Calculate average across all weeks
      if (weekValues.length > 0) {
        machineData.overallAvg = weekValues.reduce((sum, w) => sum + w.avgUtilization, 0) / weekValues.length;
      } else {
        machineData.overallAvg = 0;
      }

      machineStats.push(machineData);
    });

    return machineStats;
  };

  // Get all employees for 2nd table from custom range data
  const getAllEmployeesData = () => {
    const employeesData = [];

    validMachines.forEach(machine => {
      const data = customData[machine];
      if (data && data.employees) {
        (data.employees || []).forEach(employee => {
          if (employee) {
            const productionHours = employee.total_production_time_minutes
              ? employee.total_production_time_minutes / 60
              : (employee.total_production_time_hours || 0);

            employeesData.push({
              ...employee,
              machine: machine,
              dateRange: `${formatDateDisplay(startDate)} to ${formatDateDisplay(endDate)}`,
              isBelowThreshold: (employee.utilization_percentage || 0) < 80,
              total_production_time_hours: productionHours,
              employee_id: employee.employee_id || 'N/A',
              name: employee.name || 'Unknown',
              jobtitle: employee.jobtitle || 'N/A',
              total_gross_hours: employee.total_gross_hours || 0,
              utilization_percentage: employee.utilization_percentage || 0
            });
          }
        });
      }
    });

    return employeesData;
  };

  // Calculate overall statistics
  const getOverallStats = () => {
    const machineStats = getMachineWeeklyStats();
    const allEmployees = getAllEmployeesData();

    const machinesBelowThreshold = machineStats.filter(m => m.isBelowThreshold).length;
    const totalEmployees = allEmployees.length;
    const employeesBelowThreshold = allEmployees.filter(e => e.isBelowThreshold).length;

    const avgUtilization = machineStats.length > 0
      ? machineStats.reduce((sum, m) => sum + (m.overallAvg || 0), 0) / machineStats.length
      : 0;

    return {
      machinesBelowThreshold,
      totalMachines: validMachines.length,
      employeesBelowThreshold,
      totalEmployees,
      avgUtilization: parseFloat(avgUtilization.toFixed(1))
    };
  };

  // Handle date change
  const handleStartDateChange = (date) => {
    setStartDate(date);
    fetchCustomDateRangeData(date, endDate);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    fetchCustomDateRangeData(startDate, date);
  };

  useEffect(() => {
    fetchAllData();

    // Set initial dates: today and 7 days ago
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    setStartDate(sevenDaysAgo);
    setEndDate(today);

    // Fetch initial custom data for 2nd table
    fetchCustomDateRangeData(sevenDaysAgo, today);
  }, []);

  const machineStats = getMachineWeeklyStats();
  const allEmployees = getAllEmployeesData();
  const stats = getOverallStats();

  // Get filtered employees based on machine filter only
  const getFilteredEmployees = () => {
    return allEmployees.filter(employee => {
      const matchesMachine = selectedMachineFilter === 'All' || employee.machine === selectedMachineFilter;
      return matchesMachine;
    });
  };

  const filteredEmployees = getFilteredEmployees();
  const daysDuration = calculateDaysDuration(startDate, endDate);

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 ">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Machine Utilization Analysis
            </h1>
            <p className="text-gray-600">
              Track machine and employee utilization across 3 consecutive weeks
            </p>
          </div>
       
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-lg">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <div className="text-lg font-medium text-gray-700">Loading data for all machines...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching: {validMachines.join(', ')}</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center text-red-700 mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Error Loading Data</span>
          </div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          <div className='flex flex-row gap-4 h-[600px]'>
            {/* 1st Table - Machine Details with Week Filter */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-[40%] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Machine Utilization Details (Weekly)</h2>
                  </div>

                  <div className="flex gap-2">
                    {validMachines.map((machineName) => (
                      <button
                        key={machineName}
                        onClick={() => setSelectedMachine(machineName)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedMachine === machineName
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        {machineName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(() => {
                const machine = machineStats.find(m => m.machine === selectedMachine);
                if (!machine) return null;

                return (
                 <div className="p-4 flex-grow overflow-y-auto flex flex-col">

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Overall Average</span>
                        <span className={`text-xl font-bold ${(machine.overallAvg || 0) < 80 ? 'text-red-600' : 'text-green-600'
                          }`}>
                          {(machine.overallAvg || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${(machine.overallAvg || 0) < 80 ? 'bg-red-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.min(100, machine.overallAvg || 0)}%` }}
                        />
                      </div>
                    </div>
                    <div>

                      
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-2 border">Week</th>
                            <th className="p-2 border">Total Employees</th>
                            <th className="p-2 border">Below 80% Util</th>
                            <th className="p-2 border">Above 80% Util</th>
                            <th className="p-2 border">Avg Util %</th>
                          </tr>
                        </thead>

                        <tbody>
                          {weeks.map(week => {
                            const weekData = machine.weeks[week];
                            if (!weekData) return null;

                            const avg = weekData.avgUtilization || 0;

                            return (
                              <tr key={week} className="text-center text-md">
                                <td className="p-2 border">{week}</td>
                                <td className="p-2 border">
                                  {weekData.totalEmployees > 0 ? (
                                    weekData.totalEmployees
                                  ) : (<span className='text-black font-bold'>no data available</span>)}
                                </td>
                                <td className="p-2 border text-red-600 font-medium">
                                  {weekData.totalEmployees > 0 ? (
                                    weekData.belowThreshold
                                  ) : (<span className='text-black font-bold'>no data available</span>)}
                                </td>
                                <td className="p-2 border text-green-600 font-medium">
                                  {weekData.totalEmployees > 0 ? (
                                    weekData.aboveThreshold
                                  ) : (<span className='text-black font-bold'>no data available</span>)}
                                </td>
                                <td className={`p-2 border font-bold ${avg < 80 ? 'text-red-600' : 'text-green-600'}`}>
                                  {weekData.totalEmployees > 0 ? (
                                    <span>{avg.toFixed(1)}%</span>
                                  ) : (<span className='text-black font-bold'>no data available</span>)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* details */}
                   <div className="mt-auto p-4 space-y-2 bg-gray-50 rounded-b-lg border">

                      {/* Gross Hours Formula */}
                      <div className="text-sm">
                        <span className="font-semibold">Gross Hours = </span>
                        <span className="text-gray-600">Last Out Time − First In Time</span>
                      </div>
                       

                      {/* Production Hours Formula */}
                      <div className="text-sm">
                        <span className="font-semibold">Prod Hours = </span>
                        <span className="text-gray-600">Pass Duration  + Wash Duration + Pause Duration (Color or Plate)</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Idle Hours = </span>
                        <span className="text-gray-600">Max(Gross Hours  - Prod Hours) (if Prod Hours more than Gross Hours then Idle Hours=0)  </span>
                      </div>

                      {/* Utilization Display */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">Utilization = </span>
                        <span className="text-gray-600">(Prod Hours / Gross Hours) × 100</span>
                        
                      </div>

                      {/* Utilization Legend */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-red-500"><TrendingDown/></span>
                          <span>(if less than 80%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-500"><TrendingUp/></span>
                          <span>(if more than 80%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}


            </div>

            {/* 2nd Table - Employee Details with Date Picker */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden w-[60%] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                      Employee Idle Utilization Analysis
                    </h2>
                  </div>

                  <div className="flex flex-row gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Machine Filter
                      </label>
                      <select
                        value={selectedMachineFilter}
                        onChange={(e) => setSelectedMachineFilter(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                      >
                        <option value="All">All Machines</option>
                        {validMachines.map((machine) => (
                          <option key={machine} value={machine}>
                            {machine}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <DatePicker
                        selected={startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        maxDate={endDate}
                        dateFormat="MMM-dd"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <DatePicker
                        selected={endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        maxDate={new Date()}
                        dateFormat="MMM-dd"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                      />
                    </div>
                
                  </div>



                  {loadingCustom && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Loading data...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-grow overflow-hidden">
                <div className="overflow-x-auto h-full">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Name</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Job Title</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Machine</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Gross Hours</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Prod Hours</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Idle Hours</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Util %</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee, index) => {
                          const idleHours = Math.max(0, (employee.total_gross_hours || 0) - (employee.total_production_time_hours || 0));

                          return (
                            <tr key={index} className={`hover:bg-gray-50 ${employee.isBelowThreshold ? 'bg-red-50' : 'bg-green-50'
                              }`}>
                              <td className="py-2 px-3 text-sm font-medium text-gray-800 truncate max-w-[100px]">{employee.name}</td>
                              <td className="py-2 px-3 text-xs text-gray-700 truncate max-w-[80px]">{employee.jobtitle}</td>
                              <td className="py-2 px-3 text-xs text-gray-700">{employee.machine}</td>
                              <td className="py-2 px-3 text-xs text-gray-700">{(employee.total_gross_hours || 0).toFixed(1)}</td>
                              <td className="py-2 px-3 text-xs text-gray-700">{(employee.total_production_time_hours || 0).toFixed(1)}</td>
                              <td className="py-2 px-3">
                                <div className={`px-1.5 py-0.5 text-xs font-medium rounded ${idleHours > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                  {idleHours.toFixed(1)}
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1">
                                  <div className="w-12 h-1.5 bg-gray-200 rounded-full">
                                    <div
                                      className={`h-1.5 rounded-full ${(employee.utilization_percentage || 0) < 80 ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                      style={{ width: `${Math.min(100, employee.utilization_percentage || 0)}%` }}
                                    />
                                  </div>
                                  <span className={`font-bold text-xs ${(employee.utilization_percentage || 0) < 80 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {(employee.utilization_percentage || 0).toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                {employee.isBelowThreshold ? (
                                  <div className="flex items-center text-red-600">
                                    <TrendingDown className="w-3 h-3 mr-0.5" />
                                    <span className="text-xs font-medium">Below</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-green-600">
                                    <TrendingUp className="w-3 h-3 mr-0.5" />
                                    <span className="text-xs font-medium">Above</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-gray-500">
                            No data available for the selected date range
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
       {/* Machine Trend Chart */}
            {/*
            <div className="bg-white rounded-xl shadow-lg p-6 w-1/3 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    Machine Utilization Trend
                  </h2>
                  <p className="text-gray-600 text-sm">3-week comparison across all machines</p>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  {validMachines.map(machine => (
                    <div key={machine} className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[machine] }}></div>
                      <span className="text-gray-600">{machine}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="week"
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280' }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280' }}
                      domain={[0, 100]}
                      label={{
                        value: 'Utilization (%)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        style: { fill: '#6b7280' }
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [`${(value || 0).toFixed(1)}%`, name]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return `${data.fullWeek}\n (${data.dateRange})`;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <ReferenceLine
                      y={80}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      strokeWidth={2}
                    >
                      <Label
                        value="80% Threshold"
                        position="insideTopRight"
                        fill="#ef4444"
                      />
                    </ReferenceLine>
                    {validMachines.map(machine => (
                      <Line
                        key={machine}
                        type="monotone"
                        dataKey={machine}
                        name={machine}
                        stroke={COLORS[machine]}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
              */}
    </div>
  );
};

export default MachineUtilizationAnalysis;