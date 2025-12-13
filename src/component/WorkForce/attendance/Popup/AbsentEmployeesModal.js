import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'; // You'll need to install lucide-react or use your own icons

const AbsentEmployeesModal = ({ isOpen, onClose, timeFilter, floorFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [groupedEmployees, setGroupedEmployees] = useState({});
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Group employees by employee_id
  const groupEmployeesByID = (employeeList) => {
    const grouped = {};
    const sortedList = [...employeeList].sort((a, b) =>
      new Date(a.attendance_date) - new Date(b.attendance_date)
    );
    sortedList.forEach(employee => {
      const id = employee.employee_id;
      if (!grouped[id]) {
        grouped[id] = {
          employee_id: id,
          name: employee.name,
          floor: employee.floor,
          division: employee.division,
          machine: employee.machine,
          total_absent_days: 0,
          records: []
        };
      }
      grouped[id].records.push(employee);
      grouped[id].total_absent_days += 1;
    });

    return grouped;
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen, timeFilter, floorFilter]);

  useEffect(() => {
    if (employees.length > 0) {
      const grouped = groupEmployeesByID(employees);
      setGroupedEmployees(grouped);
    } else {
      setGroupedEmployees({});
    }
  }, [employees]);

  useEffect(() => {
    // Filter grouped employees based on search term
    if (searchTerm && Object.keys(groupedEmployees).length > 0) {
      const filtered = Object.keys(groupedEmployees).reduce((acc, employeeId) => {
        const employee = groupedEmployees[employeeId];
        const searchLower = searchTerm.toLowerCase();

        if (
          employee.name?.toLowerCase().includes(searchLower) ||
          employee.employee_id?.toLowerCase().includes(searchLower) ||
          employee.division?.toLowerCase().includes(searchLower) ||
          employee.machine?.toLowerCase().includes(searchLower)
        ) {
          acc[employeeId] = employee;
        }
        return acc;
      }, {});

      setGroupedEmployees(filtered);
    } else if (!searchTerm && employees.length > 0) {
      // Reset to original grouping when search is cleared
      const grouped = groupEmployeesByID(employees);
      setGroupedEmployees(grouped);
    }
  }, [searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      setExpandedEmployees({});

      const response = await fetch(
        `https://attendance.sequoia-print.com/api/dashboard/absent?floor=${floorFilter}&timeFilter=${timeFilter}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch absent employees data');
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setGroupedEmployees({});
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployeeExpand = (employeeId) => {
    setExpandedEmployees(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const formatDate = (dateString) => {
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
      minute: '2-digit'
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
          <h2 className="text-xl font-semibold text-gray-900">
            Absent Employees - {formatRange(timeFilter)}
          </h2>

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
              <p className="text-gray-500 mt-2">Loading absent employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : Object.keys(groupedEmployees).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No absent employees found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Absent Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(groupedEmployees).map((employee) => (
                    <React.Fragment key={employee.employee_id}>
                      <tr className={`${expandedEmployees[employee.employee_id] ? 'bg-red-50' : ''}  cursor-pointer`}>
                        <td className="px-6  whitespace-nowrap">
                          <button
                            onClick={() => toggleEmployeeExpand(employee.employee_id)}
                            className=" text-sm p-1 bg-green-200 rounded-lg"
                          >
                            {expandedEmployees[employee.employee_id] ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />

                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />

                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6  whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>

                        </td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">
                          {employee.division || 'N/A'}
                        </td>
                        <td className="px-6 whitespace-nowrap text-sm text-gray-500">
                          {employee.machine || 'N/A'}
                        </td>
                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">
                          {employee.floor || 'N/A'}
                        </td>
                        <td className="px-6  whitespace-nowrap">
                          <span className="px-3 py-1 text-sm font-semibold rounded-full  text-red-800">
                            {employee.total_absent_days} days
                          </span>
                        </td>
                        <td className="px-6  whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Absent
                          </span>
                        </td>

                      </tr>

                      {/* Expanded row with detailed records */}
                      {expandedEmployees[employee.employee_id] && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-red-50">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Hours</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Hours</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {employee.records.map((record, index) => (
                                    <tr key={record.attendance_id || index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm text-gray-900">
                                        {formatDate(record.attendance_date)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {formatTime(record.shift_start)} - {formatTime(record.shift_end)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {record.shift_duration} hrs
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {formatTime(record.first_in_of_the_day_time)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {formatTime(record.last_out_of_the_day_time)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-gray-500">
                                        {record.total_effective_hours} hrs
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
              Showing {Object.keys(groupedEmployees).length} of {new Set(employees.map(e => e.employee_id)).size} absent employees
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

export default AbsentEmployeesModal;