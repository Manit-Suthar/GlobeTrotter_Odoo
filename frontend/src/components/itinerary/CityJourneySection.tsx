import React from 'react';
import type { TripStop } from '../../services/itinerary.service';
import { groupActivitiesByDay } from '../../utils/itinerary';
import { DaySection } from './DaySection';
import { Plane } from 'lucide-react';

interface CityJourneySectionProps {
  stop: TripStop;
  isLast: boolean;
}

export const CityJourneySection: React.FC<CityJourneySectionProps> = ({ stop, isLast }) => {
  const days = groupActivitiesByDay(stop);
  
  return (
    <div className="mb-4">
      {/* City Header */}
      <div className="mb-12 text-center sm:text-left flex flex-col sm:flex-row sm:items-end sm:justify-between border-b-2 border-gray-900 pb-4">
        <div>
           <h2 className="text-4xl sm:text-5xl font-black text-gray-900 uppercase tracking-tighter">{stop.city_name}</h2>
           <p className="text-xl text-gray-500 font-medium mt-1">{stop.country}</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:text-right">
           <p className="text-lg font-bold text-gray-900 bg-gray-100 px-4 py-1.5 rounded-full inline-block sm:block sm:bg-transparent sm:p-0 sm:rounded-none">
             {new Date(stop.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()} 
             <span className="mx-2 text-gray-400 font-light">|</span>
             {new Date(stop.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
           </p>
        </div>
      </div>
      
      {/* Days Timeline */}
      <div className="pl-4 sm:pl-8">
        {days.map(day => (
           <DaySection key={day.date} day={day} />
        ))}
      </div>
      
      {/* Transition to next city */}
      {!isLast && (
        <div className="flex justify-center py-8 mb-8 relative">
          <div className="absolute left-10 right-10 top-1/2 border-t-2 border-dashed border-gray-200"></div>
          <div className="bg-gray-50 px-6 relative z-10 text-gray-300">
             <Plane size={28} className="transform rotate-90" />
          </div>
        </div>
      )}
    </div>
  );
};
