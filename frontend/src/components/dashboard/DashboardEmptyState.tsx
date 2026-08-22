import React from 'react';
import { Link } from 'react-router-dom';
import { Map, Plus } from 'lucide-react';

export const DashboardEmptyState: React.FC = () => {
  return (
    <div className="mb-14 rounded-2xl bg-white border border-gray-100 shadow-sm p-10 sm:p-16 text-center flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600"></div>
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-6">
        <Map size={36} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">Your next adventure is waiting.</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
        Start planning your first journey with GlobeTrotter and turn your dream destination into an itinerary.
      </p>
      <Link 
        to="/create-trip"
        className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
      >
        <Plus size={20} />
        <span>Plan My First Trip</span>
      </Link>
    </div>
  );
};
