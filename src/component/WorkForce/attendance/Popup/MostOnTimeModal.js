import React, { useState, useEffect } from 'react';

const MostOnTimeModal = ({ isOpen, onClose, floorFilter,timeFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen, floorFilter,timeFilter]);

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
        `https://attendance.sequoia-print.com/api/dashboard/most-on-time?floor=${floorFilter}&timeFilter=${timeFilter}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch most on-time employees data');
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setEmployees(result.data);
        setFilteredEmployees(result.data);
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
          <h2 className="text-xl font-semibold text-gray-900">Most On-Time Employees {formatRange(timeFilter)}</h2>
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
              <p className="text-gray-500 mt-2">Loading most on-time employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No data found for most on-time employees.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Days</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee, index) => (
                    <tr key={employee.employee_id || employee.id || index} className="hover:bg-gray-50">
                      <td className="px-6  whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6  whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                       
                      </td>
                      <td className="px-6 whitespace-nowrap text-sm text-gray-500">{employee.division || 'N/A'}</td>
                      <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employee.machine || 'N/A'}</td>
                      <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employee.floor || 'N/A'}</td>
                      <td className="px-6  whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {employee.count || employee.on_time_count} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} most on-time employees
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

export default MostOnTimeModal;