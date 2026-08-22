import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-64 sm:h-72 md:h-80 lg:h-96 bg-gray-200 rounded-2xl mb-12 w-full"></div>
      
      {/* Upcoming Trips Skeleton */}
      <div className="mb-14">
        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden h-[340px]">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Destinations Skeleton */}
      <div className="mb-12">
        <div className="h-8 bg-gray-200 rounded w-56 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
        <div className="flex space-x-6 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden h-[300px] flex-none w-64 md:w-72 lg:w-80">
              <div className="h-56 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
