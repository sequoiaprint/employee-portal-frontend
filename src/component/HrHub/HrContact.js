import React from 'react';

const HrContact = ({ onClose }) => {
  const hrTeam = [
    { 
      name: 'Nisha Jain', 
      role: 'HR Manager', 
      email: 'nisha@stylomedia.in', 
      phone: '+91 9830500074' 
    },
    { 
      name: 'Shikha Kar', 
      role: 'Recruitment Specialist', 
      email: 'hradmin@stylomedia.in', 
      phone: '+91 8232916650' 
    },
    { 
      name: 'Yashwi Jain', 
      role: 'Employee Relations', 
      email: 'yashwijain@sequoia-print.com', 
      phone: '+91 9903032474' 
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">HR Department</h4>
        <p className="text-gray-600">General Inquiries: hello@sequoia-print.com</p>
        <p className="text-gray-600">Hours: Monday - Saturday, 8AM - 7PM</p>
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
