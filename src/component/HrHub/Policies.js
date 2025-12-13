import React from 'react';

const Policies = ({ onClose }) => {
  const policyCategories = [
    {
      name: 'Code of Conduct',
      policies: [
        'Workplace Behavior Guidelines',
        'Anti-Harassment Policy',
        'Dress Code Policy'
      ]
    },
    {
      name: 'Employment',
      policies: [
        'Hiring Process',
        'Probation Period Policy',
        'Performance Evaluation'
      ]
    },
    {
      name: 'Time Off',
      policies: [
        'Vacation Policy',
        'Sick Leave Policy',
        'Parental Leave'
      ]
    },
    {
      name: 'Remote Work',
      policies: [
        'Work From Home Policy',
        'Equipment Provision',
        'Data Security Guidelines'
      ]
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">Company Policies</h4>
        <p className="text-gray-600">
          Access all company policies and onboarding materials. Click on any policy to view details.
        </p>
      </div>

      <div className="space-y-6">
        {policyCategories.map((category, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h5 className="font-medium text-lg mb-3">{category.name}</h5>
            <ul className="space-y-2">
              {category.policies.map((policy, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block bg-blue-100 text-blue-800 p-1 rounded mr-2"></span>
                  <span className="hover:text-blue-600 cursor-pointer">{policy}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h5 className="font-medium mb-2">Onboarding Materials</h5>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
            <div className="bg-blue-100 text-blue-800 w-10 h-10 rounded-full flex items-center justify-center mb-2">📘</div>
            <p>Employee Handbook</p>
          </div>
          <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
            <div className="bg-green-100 text-green-800 w-10 h-10 rounded-full flex items-center justify-center mb-2">🎥</div>
            <p>Orientation Videos</p>
          </div>
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

export default Policies;