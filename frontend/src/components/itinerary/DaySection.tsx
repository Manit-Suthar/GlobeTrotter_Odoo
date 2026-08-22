import React from 'react';
import type { DayGroup } from '../../utils/itinerary';
import { ViewActivityCard } from './ViewActivityCard';

interface DaySectionProps {
  day: DayGroup;
}

export const DaySection: React.FC<DaySectionProps> = ({ day }) => {
  const dateObj = new Date(day.date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayDate = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
  
  return (
    <div className="relative pl-8 sm:pl-12 pb-12">
      {/* Vertical Timeline Line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"></div>
      
      {/* Day Header Marker */}
      <div className="absolute left-[-5px] top-2.5 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-white shadow-sm"></div>
      
      <div className="mb-6 bg-white inline-block pr-4">
        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
          <span className="text-teal-600 mr-2">DAY {day.dayNumber}</span>
          <span className="text-gray-200 font-light mx-2 text-2xl leading-none -mt-1">|</span>
          <span className="text-gray-500">{dayName} · {dayDate}</span>
        </h3>
      </div>
      
      <div className="space-y-6">
        {day.activities.length === 0 ? (
          <div className="text-gray-400 italic font-medium py-2">No activities scheduled.</div>
        ) : (
          day.activities.map(act => (
            <div key={act.id} className="relative">
              {/* Activity Time Marker (subtle dash) */}
              <div className="absolute -left-8 sm:-left-12 top-10 w-6 sm:w-10 border-t-2 border-dashed border-gray-100"></div>
              <ViewActivityCard activity={act} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
