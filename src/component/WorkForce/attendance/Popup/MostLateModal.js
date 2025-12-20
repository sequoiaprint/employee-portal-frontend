import React, { useState, useEffect } from 'react';

const MostLateModal = ({ isOpen, onClose, floorFilter, timeFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('desktop');

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

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen, floorFilter, timeFilter]);

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
        `https://attendance.sequoia-print.com/api/dashboard/most-late?floor=${floorFilter}&timeFilter=${timeFilter}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch most late employees data');
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

  const formatRange = (range) => {
    if (!range) return "";
    const [start, end] = range.split("_to_");

    const format = (d) =>
      new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit" });

    return `${format(start)} to ${format(end)}`;
  };

  // Mobile card view
  const renderMobileCard = () => (
    <div className="space-y-2">
      {filteredEmployees.map((employee, index) => (
        <div key={employee.employee_id || employee.id || index} className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-1.5 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 mr-1">
                    #{index + 1}
                  </span>
                  <h3 className="inline text-sm font-semibold text-gray-900">{employee.name}</h3>
                </div>
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {employee.count || employee.late_count} days
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-1 mt-1 text-xs">
                <div>
                  <span className="text-gray-500">Division:</span>
                  <p className="font-medium">{employee.division || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Machine:</span>
                  <p className="font-medium">{employee.machine || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Floor:</span>
                  <p className="font-medium">{employee.floor || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Tablet card view
  const renderTabletCard = () => (
    <div className="space-y-2">
      {filteredEmployees.map((employee, index) => (
        <div key={employee.employee_id || employee.id || index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 mr-2">
                #{index + 1}
              </span>
              <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              {employee.count || employee.late_count} days
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Division</span>
              <p className="font-medium">{employee.division || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Machine</span>
              <p className="font-medium">{employee.machine || 'N/A'}</p>
            </div>
            <div>
              <span className="text-gray-500">Floor</span>
              <p className="font-medium">{employee.floor || 'N/A'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const renderDesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
            <th className="px-2 lg:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late Days</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredEmployees.map((employee, index) => (
            <tr key={employee.employee_id || employee.id || index} className="hover:bg-gray-50">
              <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                #{index + 1}
              </td>
              <td className="px-2 lg:px-4 py-2 whitespace-nowrap">
                <div className="text-xs lg:text-sm font-medium text-gray-900">{employee.name}</div>
              </td>
              <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-500">{employee.division || 'N/A'}</td>
              <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-500">{employee.machine || 'N/A'}</td>
              <td className="px-2 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-500">{employee.floor || 'N/A'}</td>
              <td className="px-2 lg:px-4 py-2 whitespace-nowrap">
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  {employee.count || employee.late_count} days
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-3 sm:px-4 py-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Most Late Employees - {formatRange(timeFilter)}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 px-3 sm:px-4 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, division, or machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-2 sm:p-3 md:p-4">
          {loading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5">Loading most late employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <div className="text-red-500">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-1 text-xs sm:text-sm">Error: {error}</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">No most late employees found{searchTerm && ` for "${searchTerm}"`}.</p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="md:hidden">
                {currentView === 'mobile' && renderMobileCard()}
              </div>

              {/* Tablet View */}
              <div className="hidden md:block lg:hidden">
                {currentView === 'tablet' && renderTabletCard()}
              </div>

              {/* Desktop View */}
              <div className="hidden lg:block">
                {renderDesktopTable()}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-3 sm:px-4 py-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-1.5">
            <div className="text-xs text-gray-500">
              <span>Showing {filteredEmployees.length} most late employees</span>
              {searchTerm && (
                <span> for "<span className="font-medium">{searchTerm}</span>"</span>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="px-2.5 py-1 text-xs sm:text-sm bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MostLateModal;