import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PresentEmployeesModal = ({ isOpen, onClose, timeFilter, floorFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      // Reset expanded rows when modal opens
      setExpandedRows({});
    }
  }, [isOpen, timeFilter, floorFilter]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(employee =>
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.division?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.machine?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://attendance.sequoia-print.com/api/dashboard/present?floor=${floorFilter}&timeFilter=${timeFilter}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch present employees data');
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        const processedData = processEmployeeData(result.data);
        setEmployees(processedData);
        setFilteredEmployees(processedData);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const processEmployeeData = (data) => {
    const employeeMap = new Map();

    // First sort the entire data by attendance_date (oldest to newest)
    const sortedData = [...data].sort((a, b) =>
      new Date(a.attendance_date) - new Date(b.attendance_date)
    );

    sortedData.forEach(record => {
      const employeeId = record.employee_id;

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee_id: employeeId,
          name: record.name,
          floor: record.floor,
          division: record.division,
          machine: record.machine,
          present_count: 0,
          offday_working_count: 0,
          records: []
        });
      }

      const employee = employeeMap.get(employeeId);
      employee.present_count++;

      if (record.is_offday === true || record.is_offday === 1) {
        employee.offday_working_count++;
      }

      employee.records.push(record);
    });

    return Array.from(employeeMap.values());
  };

  const toggleRowExpansion = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const showOffdayWorking = timeFilter.includes('week');

  if (!isOpen) return null;
function formatRange(range) {
  if (!range) return "";
  const [start, end] = range.split("_to_");

  const format = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit" });

  return `${format(start)} to ${format(end)}`;
}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Present Employees - {formatRange(timeFilter)}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-200 px-6 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, division, or machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading present employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No present employees found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {timeFilter.includes('week') ? 'Present Days' : 'Status'}
                    </th>
                    {showOffdayWorking && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offday Working</th>
                    )}

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee, index) => (
                    <React.Fragment key={employee.employee_id || index}>
                      <tr className={`${expandedRows[employee.employee_id] ? 'bg-green-50' : ''} hover:bg-gray-100 cursor-pointer`}>
                        <td className="px-2  whitespace-nowrap ">
                          {employee.records.length > 0 && (
                            <button
                              onClick={() => toggleRowExpansion(employee.employee_id)}
                              className="p-1  bg-green-200 rounded-lg"
                            >
                              {expandedRows[employee.employee_id] ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          )}
                        </td>
                        <td className="px-6  whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{employee.name} <span className='text-green-500'>({employee.records.length} days)</span></div>
                        </td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employee.division || 'N/A'}</td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employee.machine || 'N/A'}</td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employee.floor || 'N/A'}</td>
                        <td className="px-6  whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${timeFilter.includes('week') ?
                              (employee.present_count >= 5 ? 'bg-green-100 text-green-800' :
                                employee.present_count >= 3 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800') :
                              'bg-green-100 text-green-800'
                            }`}>
                            {timeFilter.includes('week') ?
                              `${employee.present_count} day${employee.present_count > 1 ? 's' : ''}` :
                              'Present'
                            }
                          </span>
                        </td>
                        {showOffdayWorking && (
                          <td className="px-6  whitespace-nowrap">
                            {employee.offday_working_count > 0 ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                                {employee.offday_working_count} day{employee.offday_working_count > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                        )}

                      </tr>

                      {expandedRows[employee.employee_id] && employee.records.length > 0 && (
                        <tr className="bg-green-50">
                          <td colSpan="8" className="px-6 py-4">
                            <div className="border rounded-lg overflow-hidden">

                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">First In</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Out</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shift</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Effective Hours</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Break Duration</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Offday</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {employee.records.map((record, idx) => (
                                      <tr key={record.attendance_id || idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {formatDate(record.attendance_date)}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {record.first_in_of_the_day_time ? formatTime(record.first_in_of_the_day_time) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {record.last_out_of_the_day_time ? formatTime(record.last_out_of_the_day_time) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {record.shift_start && record.shift_end ? (
                                            <>
                                              {formatTime(record.shift_start)} - {formatTime(record.shift_end)}
                                              <div className="text-xs text-gray-400">({record.shift_duration}h)</div>
                                            </>
                                          ) : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {record.total_effective_hours || 0}h
                                          {record.total_undertime > 0 && (
                                            <div className="text-xs text-red-500">Undertime: {record.total_undertime}h</div>
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {record.total_effective_overtime_duration || 0}h
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {record.total_break_duration || 0}h
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          {record.is_offday ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                              Yes
                                            </span>
                                          ) : (
                                            <span className="text-gray-400 text-xs">No</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} present employees
              {searchTerm && ` for "${searchTerm}"`}
              {showOffdayWorking && (
                <span className="ml-2">
                  • Total offday working: {employees.reduce((sum, emp) => sum + (emp.offday_working_count || 0), 0)} days
                </span>
              )}
            </span>
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentEmployeesModal;