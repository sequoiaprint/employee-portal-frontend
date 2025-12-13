import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OnTimeEmployeesModal = ({ isOpen, onClose, timeFilter, floorFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [groupedEmployees, setGroupedEmployees] = useState({});
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
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
      groupEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
      groupEmployees(employees);
    }
  }, [searchTerm, employees]);

  const groupEmployees = (employeeList) => {
    const grouped = {};
    employeeList.forEach(employee => {
      if (!grouped[employee.employee_id]) {
        grouped[employee.employee_id] = {
          employee_id: employee.employee_id,
          name: employee.name,
          floor: employee.floor,
          division: employee.division,
          machine: employee.machine,
          records: [],
          totalOnTimeDays: 0
        };
      }
      grouped[employee.employee_id].records.push(employee);
      grouped[employee.employee_id].totalOnTimeDays = grouped[employee.employee_id].records.length;
    });
    setGroupedEmployees(grouped);
  };

  const toggleExpand = (employeeId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://attendance.sequoia-print.com/api/dashboard/on-time?floor=${floorFilter}&timeFilter=${timeFilter}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch on-time employees data');
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
        setFilteredEmployees(result.data);
        groupEmployees(result.data);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setFilteredEmployees([]);
      setGroupedEmployees({});
    } finally {
      setLoading(false);
    }
  };

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
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
          <h2 className="text-xl font-semibold text-gray-900">On Time Employees - {formatRange(timeFilter)}</h2>
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
              <p className="text-gray-500 mt-2">Loading on-time employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : Object.keys(groupedEmployees).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No on-time employees found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total On Time Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(groupedEmployees).map((employeeGroup) => (
                    <React.Fragment key={employeeGroup.employee_id}>
                      <tr className={`${expandedEmployees[employeeGroup.employee_id] ? 'bg-green-50' : ''}  cursor-pointer`}>
                        <td className="px-6  whitespace-nowrap">
                          <button
                            onClick={() => toggleExpand(employeeGroup.employee_id)}
                            className="text-sm p-1 bg-green-200 rounded-lg"
                          >
                            {expandedEmployees[employeeGroup.employee_id] ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6  whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{employeeGroup.name}</div>
                          
                        </td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employeeGroup.division || 'N/A'}</td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employeeGroup.machine || 'N/A'}</td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employeeGroup.floor || 'N/A'}</td>
                        <td className="px-6  whitespace-nowrap text-sm font-medium text-gray-900">
                          {employeeGroup.totalOnTimeDays} days
                        </td>
                        <td className="px-6  whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            On Time
                          </span>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {expandedEmployees[employeeGroup.employee_id] && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-green-50">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First In</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Out</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Hours</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {employeeGroup.records.map((record, index) => (
                                    <tr key={record.attendance_id || index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(record.attendance_date)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {formatTime(record.shift_start)} - 
                                        {formatTime(record.shift_end)}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {record.first_in_of_the_day_time ? 
                                          formatTime(record.first_in_of_the_day_time) : 
                                          'N/A'}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {record.last_out_of_the_day_time ? 
                                          formatTime(record.last_out_of_the_day_time) : 
                                          'N/A'}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {record.total_effective_hours?.toFixed(2)}h
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {record.total_effective_overtime_duration?.toFixed(2)}h
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {record.total_break_duration?.toFixed(2)}h
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
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
              Showing {Object.keys(groupedEmployees).length} employees with {employees.length} total on-time records
              {searchTerm && ` for "${searchTerm}"`}
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

export default OnTimeEmployeesModal;