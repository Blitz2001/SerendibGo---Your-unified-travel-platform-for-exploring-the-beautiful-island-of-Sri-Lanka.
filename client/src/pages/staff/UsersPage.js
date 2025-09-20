import React from 'react';
import StaffLayout from '../../components/layout/StaffLayout';

const UsersPage = () => {
  return (
    <StaffLayout 
      title="User Management" 
      subtitle="Manage user accounts and permissions"
    >
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Account Management</h3>
          <p className="text-gray-600 mb-4">This page will contain the user management functionality.</p>
          <p className="text-sm text-gray-500">Coming soon...</p>
        </div>
      </div>
    </StaffLayout>
  );
};

export default UsersPage;
