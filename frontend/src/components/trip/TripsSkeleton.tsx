import React from 'react';

export const TripsSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="mb-10 w-full sm:w-96 h-[52px] bg-gray-200 rounded-xl"></div>

      {/* Upcoming Trips Skeleton */}
      <div className="mb-16">
        <div className="flex items-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="ml-4 h-6 w-10 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden h-[360px]">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5 flex flex-col h-[168px]">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                
                <div className="mt-auto space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Past Trips Skeleton */}
      <div>
        <div className="flex items-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-56"></div>
          <div className="ml-4 h-6 w-10 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 opacity-60">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden h-[360px]">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5 flex flex-col h-[168px]">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                
                <div className="mt-auto space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
