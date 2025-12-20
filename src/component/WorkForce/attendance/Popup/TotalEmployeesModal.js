import React, { useState, useEffect } from 'react';

const TotalEmployeesModal = ({ isOpen, onClose, floorFilter }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('desktop'); // 'desktop' or 'mobile'

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
  }, [isOpen, floorFilter]);

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

      const apiUrl = `https://attendance.sequoia-print.com/employees/${floorFilter !== 'all' ? `?floor=${floorFilter}` : ''}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees data');
      }
      
      const result = await response.json();
      
      let employeeData = [];
      if (Array.isArray(result)) {
        employeeData = result;
      } else if (result.success && Array.isArray(result.data)) {
        employeeData = result.data;
      } else {
        throw new Error('Invalid data format from API');
      }
      
      setEmployees(employeeData);
      setFilteredEmployees(employeeData);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Mobile card view for each employee
  const renderMobileCard = (employee, index) => (
    <div key={employee.employee_id || employee.id || index} className="bg-white border border-gray-200 rounded-lg p-2 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-xs text-gray-500">Division:</span>
          <p className="font-medium text-gray-700">{employee.division || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Machine:</span>
          <p className="font-medium text-gray-700">{employee.machine || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Floor:</span>
          <p className="font-medium text-gray-700">{employee.floor || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Status:</span>
          <p className="font-medium text-gray-700">Active</p>
        </div>
      </div>
    </div>
  );

  // Tablet card view (slightly different layout)
  const renderTabletCard = (employee, index) => (
    <div key={employee.employee_id || employee.id || index} className="bg-white border border-gray-200 rounded-lg p-2 mb-1 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{employee.name}</h3>
         
        </div>
       
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-xs text-gray-500">Division</span>
          <p className="font-medium text-gray-700">{employee.division || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Machine</span>
          <p className="font-medium text-gray-700">{employee.machine || 'N/A'}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500">Floor</span>
          <p className="font-medium text-gray-700">{employee.floor || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  // Desktop table view
  const renderDesktopTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Division</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredEmployees.map((employee, index) => (
            <tr key={employee.employee_id || employee.id || index} className="hover:bg-gray-50">
              <td className="px-4 lg:px-6  whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
              </td>
              <td className="px-4 lg:px-6  whitespace-nowrap text-sm text-gray-500">{employee.division || 'N/A'}</td>
              <td className="px-4 lg:px-6  whitespace-nowrap text-sm text-gray-500">{employee.machine || 'N/A'}</td>
              <td className="px-4 lg:px-6  whitespace-nowrap text-sm text-gray-500">{employee.floor || 'N/A'}</td>
              <td className="px-4 lg:px-6  whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  Active
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 px-4 sm:px-6 py-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Employees</h2>
            {floorFilter !== 'all' && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Filtered by: {floorFilter}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, division, or machine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm sm:text-base text-gray-500 mt-2">Loading employees...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">
                <svg className="w-12 h-12 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-sm sm:text-base">Error: {error}</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-sm sm:text-base text-gray-500">No employees found{searchTerm && ` for "${searchTerm}"`}.</p>
            </div>
          ) : (
            <>
              {/* Mobile View (sm) */}
              <div className="md:hidden">
                {currentView === 'mobile' && (
                  <div>
                    {filteredEmployees.map((employee, index) => renderMobileCard(employee, index))}
                  </div>
                )}
              </div>

              {/* Tablet View (md) */}
              <div className="hidden md:block lg:hidden">
                {currentView === 'tablet' && (
                  <div>
                    {filteredEmployees.map((employee, index) => renderTabletCard(employee, index))}
                  </div>
                )}
              </div>

              {/* Desktop View (lg+) */}
              <div className="hidden lg:block">
                {renderDesktopTable()}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-xs sm:text-sm text-gray-500">
              <span>Showing {filteredEmployees.length} of {employees.length} employees</span>
              {searchTerm && (
                <span className="ml-1">for "<span className="font-medium">{searchTerm}</span>"</span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onClose} 
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalEmployeesModal;