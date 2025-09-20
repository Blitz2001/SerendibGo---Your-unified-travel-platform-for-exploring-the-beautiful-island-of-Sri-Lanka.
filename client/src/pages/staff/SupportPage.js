import React from 'react';
import StaffLayout from '../../components/layout/StaffLayout';

const SupportPage = () => {
  return (
    <StaffLayout 
      title="Customer Support" 
      subtitle="Handle support tickets and customer inquiries"
    >
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Support Management</h3>
          <p className="text-gray-600 mb-4">This page will contain the customer support functionality.</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default SupportPage;
