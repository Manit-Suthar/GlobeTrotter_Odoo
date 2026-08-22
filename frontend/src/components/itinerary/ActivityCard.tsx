import React from 'react';
import { Clock, IndianRupee, Tag, Trash2, Edit2 } from 'lucide-react';
import type { TripActivity } from '../../services/itinerary.service';

interface ActivityCardProps {
  activity: TripActivity;
  onRemove: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onRemove, onEdit }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col sm:flex-row group relative">
      {activity.image_url && (
        <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
          <img src={activity.image_url} alt={activity.custom_name} className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-gray-900 leading-tight">{activity.custom_name}</h4>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 absolute right-3 top-3 bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-100">
            {onEdit && (
              <button onClick={() => onEdit(activity.id)} className="p-1.5 text-gray-500 hover:text-teal-600 rounded-md hover:bg-teal-50 transition-colors">
                <Edit2 size={16} />
              </button>
            )}
            <button onClick={() => onRemove(activity.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center text-sm text-gray-600 gap-y-2 gap-x-4 mb-4">
          {activity.scheduled_time && (
            <div className="flex items-center font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded-md">
              <Clock size={14} className="mr-1.5 text-teal-600" />
              {activity.scheduled_time}
              {activity.duration && <span className="text-gray-400 font-medium ml-1.5">· {activity.duration}</span>}
            </div>
          )}
          
          {activity.category && (
            <div className="flex items-center font-medium">
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
