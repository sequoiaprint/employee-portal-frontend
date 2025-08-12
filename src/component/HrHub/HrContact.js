import React from 'react';

const HrContact = ({ onClose }) => {
  const hrTeam = [
    { name: 'Sarah Johnson', role: 'HR Manager', email: 'sarah.johnson@company.com', phone: '555-0101' },
    { name: 'Michael Chen', role: 'Recruitment Specialist', email: 'michael.chen@company.com', phone: '555-0102' },
    { name: 'Emma Rodriguez', role: 'Employee Relations', email: 'emma.rodriguez@company.com', phone: '555-0103' },
    { name: 'David Kim', role: 'Benefits Administrator', email: 'david.kim@company.com', phone: '555-0104' }
  ];

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">HR Department</h4>
        <p className="text-gray-600">General Inquiries: hr@company.com</p>
        <p className="text-gray-600">Office: 555-0000</p>
        <p className="text-gray-600">Hours: Mon-Fri, 9AM-5PM</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-medium">HR Team Contacts</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hrTeam.map((person, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
              <h5 className="font-medium">{person.name}</h5>
              <p className="text-sm text-gray-600">{person.role}</p>
              <p className="text-sm mt-1">✉️ {person.email}</p>
              <p className="text-sm">📞 {person.phone}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default HrContact;