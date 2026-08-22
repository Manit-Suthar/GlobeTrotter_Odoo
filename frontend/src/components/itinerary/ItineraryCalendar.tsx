import React from 'react';
import type { Itinerary } from '../../services/itinerary.service';

interface ItineraryCalendarProps {
  itinerary: Itinerary;
}

export const ItineraryCalendar: React.FC<ItineraryCalendarProps> = ({ itinerary }) => {
  const start = new Date(itinerary.start_date);
  const end = new Date(itinerary.end_date);
  
  const calendarDays = [];
  let current = new Date(start);
  while (current <= end) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-10 mb-12">
      <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tighter">Trip Calendar</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {calendarDays.map(date => {
           const dateStr = date.toISOString().split('T')[0];
           
           const activeStop = itinerary.stops.find(s => dateStr >= s.start_date && dateStr <= s.end_date);
           
           const activities = activeStop 
             ? activeStop.activities.filter(a => a.scheduled_date === dateStr || (!a.scheduled_date && activeStop.start_date === dateStr))
             : [];

           return (
             <div key={dateStr} className={`border rounded-2xl p-4 flex flex-col min-h-[140px] transition-colors ${activeStop ? 'border-teal-200 bg-teal-50/40 hover:bg-teal-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="text-sm font-bold text-gray-500 mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</div>
                <div className="text-2xl sm:text-3xl font-black text-gray-900 leading-none mb-3">{date.getDate()}</div>
                
                {activeStop ? (
                  <div className="mt-auto space-y-1.5">
                    <div className="text-xs font-bold text-teal-800 uppercase tracking-widest truncate">{activeStop.city_name}</div>
                    {activities.length > 0 && (
                       <div className="text-xs font-bold text-teal-700 bg-teal-100/70 px-2 py-1 rounded-md inline-block">
                         {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                       </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-auto text-xs font-medium text-gray-400 italic">Travel / Free Day</div>
                )}
             </div>
           );
        })}
      </div>
    </div>
  );
};
