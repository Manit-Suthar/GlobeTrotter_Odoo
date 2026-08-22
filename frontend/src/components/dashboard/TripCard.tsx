import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { type TripSummary } from '../../services/trips.service';

interface TripCardProps {
  trip: TripSummary;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
};

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {trip.cover_image ? (
          <img 
            src={trip.cover_image} 
            alt={trip.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <MapPin size={32} />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-teal-800 shadow-sm">
          {trip.cities.length} {trip.cities.length === 1 ? 'City' : 'Cities'}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-1.5 line-clamp-1">{trip.name}</h3>
        <p className="text-sm text-gray-500 mb-5 line-clamp-1">
          {trip.cities.join(' · ')}
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center text-sm text-gray-600 font-medium">
            <Calendar size={16} className="mr-2.5 text-teal-600" />
            <span>{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
          </div>
          
          {trip.estimated_cost && (
            <div className="text-sm font-semibold text-gray-900">
              ₹{trip.estimated_cost.toLocaleString('en-IN')} <span className="text-gray-500 font-normal">estimated</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50">
        <Link 
          to={`/trips/${trip.id}`}
          className="flex items-center justify-center w-full text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors group-hover:text-teal-600"
        >
          View Trip <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
