import { useState, useEffect } from 'react';
import { Users, Building2, Calendar, User, ArrowRight, X } from 'lucide-react';

const departmentMapping = {
  "accounts": "Accounts",
  "admin": "Admin",
  "admin accounts": "Admin Accounts",
  "ctp": "CTP",
  "data entry": "Data Entry",
  "fabricator": "Fabricator",
  "hr admin": "HR Admin",
  "personal accounts": "Personal Accounts",
  "post press": "Post Press",
  "pre press": "Pre Press",
  "press, post press": "Press, Post Press",
  "proof dept": "Proof Dept",
  "silk screen": "Silk Screen"
};

const AbsentDashboard2 = () => {
  const [absentData, setAbsentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedDeptData, setSelectedDeptData] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('');
  useEffect(() => {
    fetchAbsentData();
  }, []);
  const getDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Format dates (e.g., "Nov 2, 2023 - Dec 2, 2023")
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    return `${formatDate(thirtyDaysAgo)} - ${formatDate(today)}`;
  };
  const fetchAbsentData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://attendance.sequoia-print.com/api/dashboard/monday-friday-absent');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAbsentData(data.data);
        setDateRange(getDateRange());
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching absent data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (deptKey) => {
    const formattedKey = departmentMapping[deptKey];

    // Check if department exists in the API response
    if (absentData[formattedKey]) {
      setSelectedDept(deptKey);
      setSelectedDeptData(absentData[formattedKey]);
    } else {
      // For departments not in API response (like Admin, CTP, etc.)
      setSelectedDept(deptKey);
      setSelectedDeptData({
        absent_employees: [],
        department_name: departmentMapping[deptKey],
        message: "No absent employees for this department"
      });
    }
  };

  const closeModal = () => {
    setSelectedDept(null);
    setSelectedDeptData(null);
  };

  const getTotalAbsentEmployees = (deptKey) => {
    const formattedKey = departmentMapping[deptKey];
    if (absentData[formattedKey] && absentData[formattedKey].absent_employees) {
      return absentData[formattedKey].absent_employees.length;
    }
    return 0;
  };

  const getTotalAbsentDays = (deptKey) => {
    const formattedKey = departmentMapping[deptKey];
    if (absentData[formattedKey] && absentData[formattedKey].absent_employees) {
      return absentData[formattedKey].absent_employees.reduce(
        (total, employee) => total + (employee.total_absent_days || 0),
        0
      );
    }
    return 0;
  };

  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-");

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthName = months[parseInt(month) - 1];

    return `${monthName}-${year}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading absent data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl">Error</div>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchAbsentData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 p-4 md:p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Employee Absent Departmentwise (Monday & Friday)
          </h1>
          <p className="text-gray-600 mt-2">
            Who shows a pattern of Monday or Friday absences beyond team average? (Date Range : {dateRange})
          </p>
        </div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {Object.keys(departmentMapping).map((deptKey) => (
            <div
              key={deptKey}
              onClick={() => handleCardClick(deptKey)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer border border-gray-200 p-4 hover:border-blue-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-800">
                      {departmentMapping[deptKey]}
                    </h3>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Absent Employees:</span>
                      <span className="font-medium text-gray-900">
                        {getTotalAbsentEmployees(deptKey)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Total Absent Days:</span>
                      <span className="font-medium text-gray-900">
                        {getTotalAbsentDays(deptKey)}
                      </span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-gray-400 hover:text-blue-600" />
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Click to view details
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>

      {/* Modal for Employee Details */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {departmentMapping[selectedDept]} - Absent Employees
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {selectedDeptData && selectedDeptData.absent_employees && selectedDeptData.absent_employees.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600">Total Absent Employees</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedDeptData.absent_employees.length}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600">Total Absent Days</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedDeptData.absent_employees.reduce(
                          (total, emp) => total + (emp.total_absent_days || 0), 0
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedDeptData.absent_employees.map((employee, index) => (
                      <div
                        key={employee.employee_id || index}
                        className="border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {employee.name}
                              </h3>

                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                              {employee.total_absent_days || 0} day(s)
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className='flex flex-row gap-2'>
                            <div className="text-gray-500 mb-1">Floor:</div>
                            <div className="font-medium">{employee.floor}</div>
                          </div>
                          <div className='flex flex-row gap-2'>
                            <div className="text-gray-500 mb-1">Machine/Department:</div>
                            <div className="font-medium">{employee.machine}</div>
                          </div>
                        </div>

                        <div className="mt-1 flex flex-row gap-2">
                          <div className="text-gray-500 mb-2">Absent Dates:</div>
                          <div className="flex flex-wrap py-1">
                            <span className="text-gray-700 text-sm">
                              {employee.absent_dates?.length
                                ? employee.absent_dates.map(date => formatDate(date)).join(", ")
                                : ""}
                            </span>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Absent Employees
                  </h3>
                  <p className="text-gray-500">
                    There are no absent employees recorded for this department.
                  </p>
                </div>
              )}
            </div>


          </div>
        </div>
      )}
    </div>
  );
};

export default AbsentDashboard2;