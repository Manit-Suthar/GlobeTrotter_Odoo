import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Plus } from 'lucide-react';

export const TripsEmptyState: React.FC = () => {
  return (
    <div className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm p-12 sm:p-20 text-center flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600"></div>
      
      <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-8 shadow-inner">
        <Compass size={44} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your next adventure starts here.</h3>
      
      <p className="text-gray-500 max-w-lg mx-auto mb-10 text-lg sm:text-xl font-medium leading-relaxed">
        You haven't planned a trip yet. Let's change that and turn your dream destination into reality.
      </p>
      
      <Link 
        to="/create-trip"
        className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md transform hover:-translate-y-0.5"
      >
        <Plus size={22} strokeWidth={2.5} />
        <span>Plan My First Trip</span>
      </Link>
    </div>
  );
};
