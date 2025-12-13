import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, User, Building, Printer } from 'lucide-react';

const AttendanceDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTable, setActiveTable] = useState(null); // 'proof-absent', 'proof-no-clock-out', 'ctp-absent', 'ctp-no-clock-out'

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://attendance.sequoia-print.com/api/dashboard/proof-ctp-stats');
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            console.log('API Response:', result); // Debug log
            setData(result);
        } catch (err) {
            console.error('Fetch error:', err); // Debug log
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        const [day, month, year] = dateStr.split("-");
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const monthName = months[parseInt(month) - 1];
        return `${monthName}-${day}`;
    };

    const toggleTable = (tableType) => {
        if (activeTable === tableType) {
            setActiveTable(null);
        } else {
            setActiveTable(tableType);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-gradient-to-br from-[#04b6b0] via-[#03726e] to-[#016461] rounded-lg">
                    <p className="text-white text-lg font-semibold">Error: {error}</p>
                    <button
                        onClick={fetchAttendanceData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data || !data.data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-600 text-lg font-semibold">No data available</p>
                    <button
                        onClick={fetchAttendanceData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    const proofDept = data.data['Proof Dept'] || data.data.Proof_Dept;
    const ctpDept = data.data.CTP;

    if (!proofDept || !ctpDept) {
        console.error('Missing department data:', { proofDept, ctpDept, data });
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8 bg-gradient-to-br from-[#04b6b0] via-[#03726e] to-[#016461] rounded-lg">
                    <p className="text-white text-lg font-semibold">Invalid data structure received from server</p>
                    <button
                        onClick={fetchAttendanceData}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { start, end, days_analyzed } = data.date_range || { start: 'N/A', end: 'N/A', days_analyzed: 'N/A' };

    const TableSection = ({ department, dataType, title, employees }) => {
        if (!employees || employees.length === 0) {
            return null;
        }

        return (
            <div className="mt-2 ">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
                <div className="bg-white rounded-lg shadow overflow-y-auto h-[200px]  ">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates List</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {dataType === 'absent' ? 'Absent Days' : 'No Clock-Out Days'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map((employee, index) => (
                                    <tr key={employee.employee_id || index} className="hover:bg-gray-50">
                                        <td className="px-6  whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{employee.name || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employee.floor || 'N/A'}</td>
                                        <td className="px-6  whitespace-nowrap text-sm text-gray-500">{employee.machine || 'N/A'}</td>
                                        <td className="px-6  text-sm text-gray-500">
                                            <div className="flex flex-wrap gap-1">
                                                {(
                                                    dataType === "absent"
                                                        ? employee.absent_dates
                                                        : employee.no_clock_out_dates
                                                )
                                                    ?.map((d) => `${formatDate(d)}`)
                                                    .join(", ")}
                                            </div>

                                        </td>
                                        <td className="px-6  whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${dataType === 'absent' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {dataType === 'absent' ? employee.absent_days || 0 : employee.no_clock_out_days || 0} days
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50  p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Proof Department Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Printer className="w-5 h-5" />
                            Proof Department  (<span>{formatDate(start)} to {formatDate(end)}</span>)
                        </h2>
                    </div>

                    <div className="p-6">


                        {/* Proof Department Tables */}
                        <TableSection
                            department="Proof Dept"
                            dataType="absent"
                            title="Proof Department - Absent Employees"
                            employees={proofDept.absent_employees || []}
                        />

                        <TableSection
                            department="Proof Dept"
                            dataType="no_clock_out"
                            title="Proof Department - No Clock-Out Employees"
                            employees={proofDept.no_clock_out_employees || []}
                        />
                    </div>
                </div>

                {/* CTP Department Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-green-600 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Printer className="w-5 h-5" />
                            CTP Department  (<span>{formatDate(start)} to {formatDate(end)}</span>)
                        </h2>
                    </div>

                    <div className="p-6">


                        {/* CTP Department Tables */}
                        <TableSection
                            department="CTP"
                            dataType="absent"
                            title="CTP Department - Absent Employees"
                            employees={ctpDept.absent_employees || []}
                        />

                        <TableSection
                            department="CTP"
                            dataType="no_clock_out"
                            title="CTP Department - No Clock-Out Employees"
                            employees={ctpDept.no_clock_out_employees || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceDashboard;