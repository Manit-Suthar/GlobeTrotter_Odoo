import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { itineraryService, type Itinerary } from '../services/itinerary.service';

export const TripCalendarPage = () => {
  const { id } = useParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    itineraryService.getItinerary(id)
      .then(setItinerary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-20 text-center animate-pulse"><div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div><div className="h-8 w-48 bg-gray-200 mx-auto rounded"></div></div>;
  }

  if (!itinerary) return null;

  const start = new Date(itinerary.start_date);
  const end = new Date(itinerary.end_date);
  
  const calendarDays = [];
  let current = new Date(start);
  while (current <= end) {
    calendarDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <Link to={`/trips/${id}`} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-teal-600 transition-colors mb-4">
              <ArrowLeft size={16} className="mr-1.5" /> Back to {itinerary.name}
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter flex items-center">
               <CalendarDays className="mr-4 text-teal-600" size={40} /> Trip Calendar
            </h1>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
          {/* Header row (Days of week) */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">{d}</div>
             ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-[160px]">
            {/* Offset to start on correct day of week */}
            {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
               <div key={`empty-${i}`} className="border-b border-r border-gray-50 bg-gray-50/30"></div>
            ))}
            
            {calendarDays.map((date, idx) => {
               const dateStr = date.toISOString().split('T')[0];
               const activeStop = itinerary.stops.find(s => dateStr >= s.start_date && dateStr <= s.end_date);
               const activities = activeStop 
                 ? activeStop.activities.filter(a => a.scheduled_date === dateStr || (!a.scheduled_date && activeStop.start_date === dateStr))
                 : [];

               return (
                 <div key={dateStr} className={`border-b border-r border-gray-100 p-3 flex flex-col transition-colors hover:bg-gray-50 ${activeStop ? '' : 'bg-gray-50/50'}`}>
                    <div className="text-right">
                       <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${activeStop ? 'bg-gray-900 text-white' : 'text-gray-400'}`}>
                          {date.getDate()}
                       </span>
                    </div>
                    
                    {activeStop && (
                      <div className="mt-2 flex-1 flex flex-col gap-1.5 overflow-y-auto hide-scrollbar">
                         <div className="text-[10px] font-black text-teal-700 uppercase tracking-widest flex items-center mb-1">
                            <MapPin size={10} className="mr-1" /> {activeStop.city_name}
                         </div>
                         
                         {activities.map(act => (
                            <div key={act.id} className="bg-teal-50 border border-teal-100 px-2 py-1.5 rounded text-xs font-medium text-teal-900 truncate shadow-sm">
                               {act.scheduled_time && <span className="font-bold opacity-70 mr-1">{act.scheduled_time}</span>}
                               {act.custom_name}
                            </div>
                         ))}
                      </div>
                    )}
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
