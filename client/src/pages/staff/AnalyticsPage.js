import React from 'react';
import StaffLayout from '../../components/layout/StaffLayout';

const AnalyticsPage = () => {
  return (
    <StaffLayout 
      title="Analytics & Reports" 
      subtitle="View site statistics and generate reports"
    >
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Site Analytics & Reports</h3>
          <p className="text-gray-600 mb-4">This page will contain comprehensive analytics and reporting functionality.</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default AnalyticsPage;
