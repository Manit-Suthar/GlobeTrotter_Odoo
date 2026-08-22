import React from 'react';

export const ItineraryViewSkeleton = () => {
  return (
    <div className="animate-pulse w-full max-w-5xl mx-auto pb-24 px-4 sm:px-6 mt-8">
      {/* Hero Skeleton */}
      <div className="w-full h-64 sm:h-[400px] bg-gray-200 rounded-3xl mb-12"></div>

      {/* City Section Skeleton */}
      <div className="space-y-16">
        {[1, 2].map((city) => (
          <div key={city}>
            {/* City Header */}
            <div className="mb-10 flex flex-col sm:flex-row justify-between border-b-2 border-gray-200 pb-4">
              <div>
                <div className="h-12 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-4 sm:mt-0 h-8 w-40 bg-gray-200 rounded"></div>
            </div>
            
            <div className="pl-4 sm:pl-8 space-y-12">
              {[1, 2].map(day => (
                <div key={day} className="pl-8 sm:pl-12 relative">
                   <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"></div>
                   <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
                   
                   <div className="h-32 bg-gray-100 rounded-2xl flex p-4 mb-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-xl mr-4"></div>
                      <div className="flex-1">
                         <div className="h-6 w-1/3 bg-gray-200 rounded mb-3"></div>
                         <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
