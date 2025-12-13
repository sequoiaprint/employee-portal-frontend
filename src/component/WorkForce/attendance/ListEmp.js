import React, { useState, useEffect } from 'react';

const ListEmp = ({ isOpen, onClose, type, title, timeFilter, floorFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && type) {
      fetchEmployees();
    }
  }, [isOpen, type, timeFilter, floorFilter]);

  useEffect(() => {
    // Filter employees based on search term
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

      let apiUrl = '';
      
      if (type === 'all') {
        apiUrl = 'https://attendance.sequoia-print.com/employees/';
      } else {
        apiUrl = `https://attendance.sequoia-print.com/api/dashboard/${type}?floor=${floorFilter}&timeFilter=${timeFilter}`;
      }

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees data');
      }
      
      const result = await response.json();
      
      // Handle different response formats
      let employeeData = [];
      
      if (type === 'all') {
        // For all employees endpoint, it returns direct array
        if (Array.isArray(result)) {
          employeeData = result;
        } else if (result.success && Array.isArray(result.data)) {
          employeeData = result.data;
        } else {
          throw new Error('Invalid data format from API');
        }
      } else {
        // For dashboard endpoints, expect success and data structure
        if (result.success && Array.isArray(result.data)) {
          employeeData = result.data;
        } else {
          throw new Error('Invalid data format from API');
        }
      }
      
      // Process data to aggregate by employee for weekly data
      const processedData = processEmployeeData(employeeData, type);
      setEmployees(processedData);
      setFilteredEmployees(processedData);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Process data to aggregate by employee ID for weekly data
  const processEmployeeData = (data, employeeType) => {
    if (employeeType === 'all') {
      // For all employees, no aggregation needed
      return data;
    }

    // For weekly data, aggregate by employee_id
    const employeeMap = new Map();

    data.forEach(record => {
      const employeeId = record.employee_id;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee_id: employeeId,
          name: record.name,
          floor: record.floor,
          division: record.division,
          machine: record.machine,
          present_count: 0, // Total present days
          offday_working_count: 0, // Only offday working days
          records: []
        });
      }

      const employee = employeeMap.get(employeeId);
      employee.present_count++; // Count all present days
      
      // Count only if it's an offday working (is_offday is true/1)
      if (record.is_offday === true || record.is_offday === 1) {
        employee.offday_working_count++;
      }
      
      employee.records.push(record);
    });

    return Array.from(employeeMap.values());
  };

  const getStatusDisplay = (employee, employeeType) => {
    if (employeeType === 'all') return null;

    if (timeFilter.includes('week')) {
      // For weekly data, show present count
      return `${employee.present_count} day${employee.present_count > 1 ? 's' : ''}`;
    } else {
      // For daily data, show status
      return employeeType === 'present' ? 'Present' : 
             employeeType === 'absent' ? 'Absent' : 
             employeeType === 'on-time' ? 'On Time' : 'Late';
    }
  };

  const getStatusBadgeClass = (employee, employeeType) => {
    if (employeeType === 'all') return '';
    
    if (timeFilter.includes('week')) {
      // Color code based on present count for weekly data
      if (employee.present_count >= 5) return 'bg-green-100 text-green-800';
      if (employee.present_count >= 3) return 'bg-blue-100 text-blue-800';
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return employeeType === 'present' ? 'bg-green-100 text-green-800' :
             employeeType === 'absent' ? 'bg-red-100 text-red-800' :
             employeeType === 'on-time' ? 'bg-blue-100 text-blue-800' :
             'bg-yellow-100 text-yellow-800';
    }
  };

  // Check if we should show offday working column
  const showOffdayWorking = type === 'present' && timeFilter.includes('week');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, division, or machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading employee data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No employees found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Division
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Machine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Floor
                    </th>
                    {type !== 'all' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {timeFilter.includes('week') ? 'Total Present Days' : 'Status'}
                      </th>
                    )}
                    {showOffdayWorking && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offday Working
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee, index) => (
                    <tr key={employee.employee_id || employee.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                       
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.division || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.machine || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.floor || 'N/A'}
                      </td>
                      {type !== 'all' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(employee, type)}`}>
                            {getStatusDisplay(employee, type)}
                          </span>
                        </td>
                      )}
                      {showOffdayWorking && (
                        <td className="px-6 py-4 whitespace-nowrap">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} employee{employees.length !== 1 ? 's' : ''}
              {searchTerm && ` for "${searchTerm}"`}
              {showOffdayWorking && (
                <span className="ml-2">
                  • Total offday working: {employees.reduce((sum, emp) => sum + (emp.offday_working_count || 0), 0)} days
                </span>
              )}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListEmp;