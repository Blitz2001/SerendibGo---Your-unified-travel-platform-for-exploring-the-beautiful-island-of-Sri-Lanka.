import React from 'react';
import GuideNavigation from '../navigation/GuideNavigation';

const GuideLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <GuideNavigation />
      <div className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="text-3xl font-bold text-gray-900">{title}</h1>}
              {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
            </div>
          )}
          
          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default GuideLayout;
