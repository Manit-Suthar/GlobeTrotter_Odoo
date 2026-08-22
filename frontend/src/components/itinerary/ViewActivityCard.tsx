import React from 'react';
import { Clock, IndianRupee, Tag } from 'lucide-react';
import type { TripActivity } from '../../services/itinerary.service';

interface ViewActivityCardProps {
  activity: TripActivity;
}

export const ViewActivityCard: React.FC<ViewActivityCardProps> = ({ activity }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col sm:flex-row relative group">
      {activity.image_url && (
        <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
          <img 
            src={activity.image_url} 
            alt={activity.custom_name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        </div>
      )}
      
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        <h4 className="text-xl font-bold text-gray-900 leading-tight mb-2">{activity.custom_name}</h4>
        
        <div className="flex flex-wrap items-center text-sm gap-y-2 gap-x-4 mb-4">
          {activity.scheduled_time && (
            <div className="flex items-center font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
              <Clock size={14} className="mr-1.5 text-teal-600" />
              {activity.scheduled_time}
              {activity.duration && <span className="text-teal-600/70 ml-1.5">· {activity.duration}</span>}
            </div>
          )}
          
          {activity.category && (
            <div className="flex items-center font-medium text-gray-500">
              <Tag size={14} className="mr-1.5 text-gray-400" />
              {activity.category}
            </div>
          )}
        </div>
        
        {activity.cost_estimate > 0 && (
          <div className="mt-auto flex items-center font-bold text-gray-900 text-lg">
            <IndianRupee size={16} className="mr-0.5 text-gray-500" />
            {activity.cost_estimate.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
