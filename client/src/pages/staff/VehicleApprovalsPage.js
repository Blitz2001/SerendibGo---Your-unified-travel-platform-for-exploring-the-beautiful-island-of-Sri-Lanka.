import React from 'react';
import StaffLayout from '../../components/layout/StaffLayout';

const VehicleApprovalsPage = () => {
  return (
    <StaffLayout 
      title="Vehicle Approvals" 
      subtitle="Review and approve vehicle registration requests"
    >
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle Registration Approvals</h3>
          <p className="text-gray-600 mb-4">This page will contain the vehicle approval functionality.</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default VehicleApprovalsPage;
