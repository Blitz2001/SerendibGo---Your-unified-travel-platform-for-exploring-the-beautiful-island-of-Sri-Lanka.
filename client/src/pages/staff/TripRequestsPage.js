import React from 'react';
import StaffLayout from '../../components/layout/StaffLayout';

const TripRequestsPage = () => {
  return (
    <StaffLayout 
      title="Trip Requests" 
      subtitle="Manage and approve custom trip requests from customers"
    >
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trip Requests Management</h3>
          <p className="text-gray-600 mb-4">This page will contain the trip request management functionality.</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default TripRequestsPage;
