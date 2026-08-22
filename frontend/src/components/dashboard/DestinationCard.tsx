import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { type City } from '../../services/cities.service';

interface DestinationCardProps {
  city: City;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ city }) => {
  return (
    <div className="group relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex-none w-64 md:w-72 lg:w-80">
      <div className="relative h-56 overflow-hidden">
        {city.image_url ? (
          <img 
            src={city.image_url} 
            alt={city.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <MapPin size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/10 to-transparent"></div>
        
        {city.popularity && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-gray-800 shadow-sm">
            {city.popularity}
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-xl font-bold mb-0.5">{city.name}</h3>
          <p className="text-sm text-gray-200 font-medium">{city.country}</p>
        </div>
      </div>
      
      <div className="p-5 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
          {city.cost_index}
        </div>
        <Link 
          to="/explore" 
          className="inline-flex items-center text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
        >
          Explore <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
