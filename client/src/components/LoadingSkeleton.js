import React from 'react';

const LoadingSkeleton = ({ type = 'default', count = 1, className = '' }) => {
  const SkeletonCard = () => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );

  const SkeletonChart = () => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-48 bg-gray-200 rounded"></div>
    </div>
  );

  const SkeletonStats = () => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  );

  const SkeletonTable = () => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonGuideCard = () => (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse ${className}`}>
      <div className="h-48 bg-gray-200"></div>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const SkeletonBookingCard = () => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 animate-pulse ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return <SkeletonCard />;
      case 'chart':
        return <SkeletonChart />;
      case 'stats':
        return <SkeletonStats />;
      case 'table':
        return <SkeletonTable />;
      case 'guide-card':
        return <SkeletonGuideCard />;
      case 'booking-card':
        return <SkeletonBookingCard />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <div className="space-y-6">
      {[...Array(count)].map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Spinner component for buttons and small loading states
export const Spinner = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ isLoading, children, message = 'Loading...' }) => {
  if (!isLoading) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <div className="flex flex-col items-center space-y-3">
          <Spinner size="lg" />
          <p className="text-gray-600 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
