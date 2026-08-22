import React from 'react';
import { Calendar, Plus, MapPin, Trash2 } from 'lucide-react';
import type { TripStop } from '../../services/itinerary.service';
import { ActivityCard } from './ActivityCard';

interface StopSectionProps {
  stop: TripStop;
  isFirst: boolean;
  isLast: boolean;
  onAddActivity: (stopId: string) => void;
  onRemoveStop: (stopId: string) => void;
  onRemoveActivity: (stopId: string, activityId: string) => void;
}

export const StopSection: React.FC<StopSectionProps> = ({ 
  stop, isLast, onAddActivity, onRemoveStop, onRemoveActivity 
}) => {
  return (
    <div className="relative flex">
      {/* Timeline connector */}
      <div className="mr-4 sm:mr-8 flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-teal-100 border-4 border-white flex items-center justify-center text-teal-600 z-10 shadow-sm mt-8 sm:mt-10">
          <MapPin size={14} className="fill-teal-600" />
        </div>
        {!isLast && (
          <div className="w-1 h-full bg-gradient-to-b from-teal-100 to-teal-50/20 min-h-[100px]"></div>
        )}
      </div>

      <div className="flex-1 pb-16">
        {/* Stop Header */}
        <div className="group relative bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden mb-8">
          <div className="flex flex-col sm:flex-row">
            {stop.image_url ? (
              <div className="sm:w-56 h-40 sm:h-auto">
                <img src={stop.image_url} alt={stop.city_name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="sm:w-56 h-40 sm:h-auto bg-teal-50 flex items-center justify-center">
                <MapPin size={32} className="text-teal-200" />
              </div>
            )}
            
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{stop.city_name}</h2>
                  <p className="text-gray-500 font-medium mb-4 text-lg">{stop.country}</p>
                </div>
                
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure you want to remove this stop from your journey?')) {
                      onRemoveStop(stop.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  title="Remove Stop"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="flex items-center text-sm font-bold text-teal-800 bg-teal-50 px-3.5 py-2 rounded-lg w-fit border border-teal-100">
                <Calendar size={16} className="mr-2.5" />
                {new Date(stop.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} 
                &nbsp;—&nbsp;
                {new Date(stop.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="pl-2 sm:pl-4 space-y-4 relative">
          {stop.activities.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-100/50 transition-colors cursor-pointer" onClick={() => onAddActivity(stop.id)}>
              <p className="text-gray-500 font-bold mb-3 text-lg">No plans for this day yet.</p>
              <span className="inline-flex items-center text-base font-bold text-teal-600">
                <Plus size={18} className="mr-1.5" strokeWidth={2.5} /> Add something memorable
              </span>
            </div>
          ) : (
            <>
              {stop.activities.map(act => (
                <ActivityCard 
                  key={act.id} 
                  activity={act} 
                  onRemove={(actId) => onRemoveActivity(stop.id, actId)} 
                />
              ))}
              <div className="pt-3">
                <button 
                  onClick={() => onAddActivity(stop.id)}
                  className="inline-flex items-center px-5 py-2.5 text-base font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-100"
                >
                  <Plus size={20} className="mr-1.5" strokeWidth={2.5} />
                  Add Activity
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
