import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LeaveForm from '../../component/HrHub/LeaveForm';
import RaiseComplaint from '../../component/HrHub/RaiseComplaint';
import HrContact from '../../component/HrHub/HrContact';
import Policies from '../../component/HrHub/Policies';
import Faqs from '../../component/HrHub/Faqs';

const HrHub = () => {
  const [activePopup, setActivePopup] = useState(null);
  const [submittedData, setSubmittedData] = useState({
    leaveForms: [],
    complaints: [],
  });

  const closePopup = () => setActivePopup(null);

  const handleSubmit = (type, data) => {
    setSubmittedData(prev => ({
      ...prev,
      [type]: [...prev[type], data]
    }));
    closePopup();
  };

  const sections = [
    {
      id: 'leave',
      title: 'Leave Forms',
      description: 'Submit and track your leave requests',
      color: 'bg-blue-100 border-blue-300',
      button: 'bg-blue-500 hover:bg-blue-600',
      component: <LeaveForm onSubmit={(data) => handleSubmit('leaveForms', data)} onClose={closePopup} />
    },
    {
      id: 'complaint',
      title: 'Raise a Complaint',
      description: 'Submit workplace concerns or issues',
      color: 'bg-orange-100 border-orange-300',
      button: 'bg-orange-500 hover:bg-orange-600',
      component: <RaiseComplaint onSubmit={(data) => handleSubmit('complaints', data)} onClose={closePopup} />
    },
    {
      id: 'contact',
      title: 'HR Contact Info',
      description: 'Get in touch with HR representatives',
      color: 'bg-green-100 border-green-300',
      button: 'bg-green-500 hover:bg-green-600',
      component: <HrContact onClose={closePopup} />
    },
    {
      id: 'policies',
      title: 'Company Policies',
      description: 'Access onboarding materials and guidelines',
      color: 'bg-purple-100 border-purple-300',
      button: 'bg-purple-500 hover:bg-purple-600',
      component: <Policies onClose={closePopup} />
    },
    {
      id: 'faqs',
      title: 'FAQs',
      description: 'Find answers to common questions',
      color: 'bg-amber-100 border-amber-300',
      button: 'bg-amber-500 hover:bg-amber-600',
      component: <Faqs onClose={closePopup} />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
      {/* Header */}
      <header
        className="relative rounded-xl mb-8 p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundImage: 'url("https://voicemsgsequoia.s3.ap-south-1.amazonaws.com/Adobe_216510737-1200x675-1.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "240px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-gray-600/60 blur-sm rounded-xl"></div>
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 drop-shadow-lg transition-all duration-300 hover:text-blue-300">
            HR Hub 
          </h1>
          <p className="text-md sm:text-lg opacity-90 drop-shadow-md transition-all duration-300 hover:opacity-100">
            Employee resources and support 
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium drop-shadow-md">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-lime-500 inline-block animate-pulse"></span>
              <span>Internal HR Hub</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <div 
            key={section.id} 
            className={`${section.color} border rounded-xl p-6 transition-all duration-300 hover:shadow-md`}
          >
            <h2 className="text-xl font-bold mb-2">{section.title}</h2>
            <p className="text-gray-600 mb-4">{section.description}</p>
            <button
              onClick={() => setActivePopup(section.id)}
              className={`${section.button} text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md`}
            >
              Access {section.title}
            </button>
            
            {/* Display submitted data if available */}
            {submittedData[`${section.id}Forms`]?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Your Submissions:</h3>
                <ul className="space-y-2">
                  {submittedData[`${section.id}Forms`].map((item, index) => (
                    <li key={index} className="bg-white/50 p-2 rounded">
                      {item.title || `Submission ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Popup Modals */}
      {activePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {sections.find(s => s.id === activePopup)?.title}
                </h3>
                <button 
                  onClick={closePopup}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              {sections.find(s => s.id === activePopup)?.component}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrHub;