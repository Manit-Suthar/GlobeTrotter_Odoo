import React from 'react';

export const ItinerarySkeleton = () => {
  return (
    <div className="animate-pulse w-full max-w-5xl mx-auto pb-24">
      {/* Header Skeleton */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 pb-8">
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 w-64 sm:w-96 bg-gray-200 rounded mb-3"></div>
          <div className="h-5 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4 sm:mt-0 h-12 w-32 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-12">
        {[1, 2].map((city) => (
          <div key={city} className="flex relative">
            <div className="mr-6 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-gray-200 z-10"></div>
              <div className="w-0.5 h-full bg-gray-200 -mt-2"></div>
            </div>
            
            <div className="flex-1 pb-10">
              {/* City Header */}
              <div className="h-24 bg-gray-100 rounded-xl mb-6 flex items-center p-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4"></div>
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-4 pl-4 sm:pl-8 border-l-2 border-gray-50">
                {[1, 2].map(act => (
                  <div key={act} className="h-32 bg-white border border-gray-100 shadow-sm rounded-xl flex p-4">
                     <div className="w-24 h-24 bg-gray-200 rounded-lg mr-4 hidden sm:block"></div>
                     <div className="flex-1">
                        <div className="h-5 w-1/3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-1/5 bg-gray-200 rounded mt-6"></div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
