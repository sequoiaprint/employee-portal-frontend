import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Clock,
  User,
  Users,
  Layers,
  CheckCircle,
  AlertCircle,
  HardDrive,
  X,
  ChevronRight,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const OvertimeMachineTable = () => {
  const [overtimeData, setOvertimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    // Default: 7 days ago
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [endDate, setEndDate] = useState(() => {
    // Default: today
    return new Date();
  });
  const [machineFilter, setMachineFilter] = useState('KOMORI');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validMachines = ['KOMORI', 'RYOBI2', 'RYOBI 3'];

  // Calculate days duration
  const daysDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  const handleStartDateChange = (date) => {
    if (date > endDate) {
      // If start date is after end date, adjust both
      setStartDate(date);
      setEndDate(date);
    } else {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (date) => {
    if (date < startDate) {
      // If end date is before start date, adjust both
      setEndDate(date);
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  // Format date to YYYY-MM-DD for API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch overtime data
  useEffect(() => {
    const fetchOvertimeData = async () => {
      console.log('Fetching overtime data with filters:', {
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        machineFilter
      });

      try {
        setLoading(true);

        // Build time filter string for API
        const timeFilter = `${formatDateForAPI(startDate)}_to_${formatDateForAPI(endDate)}`;

        // Build API URL with filters
        let url = `https://attendance.sequoia-print.com/api/overtime/${machineFilter}/${timeFilter}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch overtime machine data: ${response.status}`);
        }

        const result = await response.json();
        console.log('Fetched overtime data:', result);

        // Get employees with overtime
        const overtimeEmployees = result.overtime_employees || [];
        // Get all employees
        const allEmployees = result.employees || [];

        console.log('All employees count:', allEmployees.length);
        console.log('Overtime employees count:', overtimeEmployees.length);

        // If no employees returned at all, set empty data
        if (allEmployees.length === 0) {
          console.log('No employees found for machine:', machineFilter);
          setOvertimeData([]);
          setError(null);
          return;
        }

        // Combine all employees with overtime data
        const processedData = allEmployees.map(employee => {
          // Find matching employee in overtime data
          const overtimeEmployee = overtimeEmployees.find(oe => {
            // Match by employee_id if both have it
            if (oe.employee_id && employee.employee_id) {
              return oe.employee_id === employee.employee_id;
            }
            // Fallback to name matching
            return oe.name === employee.name;
          });

          if (overtimeEmployee) {
            // Calculate total passes for this employee
            const totalPass = overtimeEmployee.jobs?.reduce((sum, job) =>
              sum + (job.total_passes || 0), 0) || 0;

            return {
              ...employee,
              total_pass: totalPass,
              total_effective_hours: overtimeEmployee.total_effective_hours || 0,
              total_effective_overtime_duration: overtimeEmployee.total_effective_overtime_duration || 0,
              jobs: overtimeEmployee.jobs || [],
              hasOvertime: true
            };
          } else {
            // Employee has no overtime
            return {
              ...employee,
              total_pass: 0,
              total_effective_hours: 0,
              total_effective_overtime_duration: 0,
              jobs: [],
              hasOvertime: false
            };
          }
        });

        console.log('Processed data count:', processedData.length);
        setOvertimeData(processedData);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setOvertimeData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOvertimeData();
  }, [startDate, endDate, machineFilter]);

  // Format time duration from decimal hours
  const formatDuration = (hours) => {
    if (hours === undefined || hours === null || hours === 0) return '0h 0m';
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  const openJobModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Modal Component
  const JobDetailsModal = () => {
    if (!selectedEmployee || !selectedEmployee.jobs) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={closeJobModal}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    {selectedEmployee.machine || machineFilter}
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4" />
                    Total Overtime: {formatDuration(selectedEmployee.total_effective_overtime_duration)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                   {selectedEmployee.jobs.length} Jobs
                </div>
                <button
                  onClick={closeJobModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Jobs List */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {selectedEmployee.jobs && selectedEmployee.jobs.length > 0 ? (
                    selectedEmployee.jobs.map((job, index) => (
                      <div
                        key={job.JOBNO || index}
                        className="border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start ">
                          <div className="flex flex-row items-start gap-3">
                            <div className="mt-1 bg-blue-50 rounded-lg ">
                              <Layers className="w-4 h-4 text-blue-500" />
                            </div>
                            <h4 className="font-medium text-gray-900">
                              {job.JOBNAME || `Job #${index + 1}`} ( job no: {job.JOBNO || 'N/A'})
                            </h4>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold ">
                              {job.total_passes || 0} Passes
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No job details available for this employee</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Overtime by Employee</h2>
              <p className="text-sm text-gray-500">Overtime hours tracked per employee on {machineFilter}</p>
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="flex flex-col md:flex-row gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Date Range Selection
            </h3>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
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

              <div className="flex-1">
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
          </div>

          <div className="w-full md:w-64">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Machine Selection
            </label>
            <select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {validMachines.map(machine => (
                <option key={machine} value={machine}>{machine}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading overtime data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Overtime by Employee</h2>
              <p className="text-sm text-gray-500">Overtime hours tracked per employee on {machineFilter}</p>
            </div>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium">Error: {error}</p>
            <p className="text-red-500 text-sm mt-2">Failed to load overtime data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 flex-grow overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Overtime by Employee</h2>
            <p className="text-sm text-gray-500">
              Overtime hours tracked per employee on {machineFilter} from {formatDateForAPI(startDate)} to {formatDateForAPI(endDate)}
            </p>
          </div>
        </div>

        {overtimeData.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              <Users className="w-4 h-4 inline mr-1" />
              {overtimeData.length} Employee{overtimeData.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Date Range Picker and Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range Selection
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="">
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

            <div className="">
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
        </div>

        <div className="w-full md:w-64 flex flex-col justify-end">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Machine Selection
          </label>
          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {validMachines.map(machine => (
              <option key={machine} value={machine}>{machine}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {overtimeData.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">No Employees Found</h4>
            <p className="text-yellow-600">No employees found for the selected machine: {machineFilter}</p>
            <p className="text-yellow-500 text-sm mt-2">Please select a different machine or check if employees are assigned to this machine.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto flex flex-col flex-grow">

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employee Name
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Gross Hours
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    OT Hours
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Total Passes
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {overtimeData.map((employee) => (
                <tr
                  key={employee.employee_id || employee.name}
                  className={`hover:bg-gray-50 ${!employee.hasOvertime ? 'opacity-70' : ''}`}
                >
                  <td className="px-6  whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${employee.hasOvertime ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <User className={`h-5 w-5 ${employee.hasOvertime ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>

                      </div>
                    </div>
                  </td>

                  <td className="px-6  whitespace-nowrap">
                    <div className="text-sm">
                      <div className={`font-medium text-lg ${employee.hasOvertime ? 'text-gray-900' : 'text-gray-400'}`}>
                        {formatDuration(employee.total_effective_hours)}
                      </div>
                    </div>
                  </td>

                  <td className="px-6  whitespace-nowrap">
                    <div className="text-sm">
                      <div className={`font-medium text-lg ${employee.hasOvertime ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatDuration(employee.total_effective_overtime_duration)}
                      </div>
                    </div>
                  </td>

                  <td className="px-6  whitespace-nowrap">
                    <div className="relative">
                      {employee.hasOvertime && employee.jobs && employee.jobs.length > 0 ? (
                        <button
                          onClick={() => openJobModal(employee)}
                          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors"
                        >
                          <Layers className="w-4 h-4 mr-2" />
                          {employee.total_pass || 0} Passes
                          <span className="ml-2 text-xs bg-green-200 text-green-900 px-1.5 py-0.5 rounded-full">
                            {employee.jobs.length} jobs
                          </span>
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </button>
                      ) : (
                        <div className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                          <Layers className="w-4 h-4 mr-2" />
                          No Passes
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6  whitespace-nowrap">
                    {employee.hasOvertime ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Overtime Recorded
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        No Overtime Observed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* details */}

          <div className="mt-auto p-4 space-y-2 bg-gray-50 rounded-b-lg border">
            {/* Gross Hours Formula */}
            <div className="text-sm">
              <span className="font-semibold">Gross Hours = </span>
              <span className="text-gray-600">Last Out Time − First In Time</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold">Over Time = </span>
              <span className="text-gray-600">Gross Hours - Regular Shift(Regular In Time - Regular End Time)</span>
            </div>

          </div>
        </div>
      )}

      {/* Render modal */}
      {isModalOpen && <JobDetailsModal />}
    </div>
  );
};

export default OvertimeMachineTable;