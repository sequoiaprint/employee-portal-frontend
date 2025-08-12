import React, { useState } from 'react';

const Faqs = ({ onClose }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I request time off?",
      answer: "Submit a leave request through the HR Hub at least two weeks in advance for planned time off. For sick leave, notify your manager and submit the request as soon as possible."
    },
    {
      question: "What is the process for reporting harassment?",
      answer: "You can file a confidential complaint through the 'Raise a Complaint' section of the HR Hub or contact any HR representative directly. All complaints are investigated promptly and discreetly."
    },
    {
      question: "How often are performance reviews conducted?",
      answer: "Formal performance reviews are conducted annually, with informal check-ins every quarter. Your manager will schedule these meetings and provide feedback."
    },
    {
      question: "What benefits am I eligible for?",
      answer: "Full-time employees are eligible for health insurance, retirement plans, and paid time off after 90 days. Contract terms may vary - check with HR for your specific benefits package."
    },
    {
      question: "How do I update my personal information?",
      answer: "Personal information can be updated through the employee portal. For changes to legal name or tax information, please contact HR directly with supporting documentation."
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-2">Frequently Asked Questions</h4>
        <p className="text-gray-600">
          Find answers to common HR-related questions below.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
            >
              <span className="font-medium">{faq.question}</span>
              <span>{activeIndex === index ? '−' : '+'}</span>
            </button>
            {activeIndex === index && (
              <div className="p-4 bg-white">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h5 className="font-medium mb-2">Still have questions?</h5>
        <p className="text-gray-600 mb-4">
          Contact HR directly through the HR Contact section or email hr@company.com
        </p>
      </div>

      <div className="flex justify-end pt-4">
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

export default Faqs;