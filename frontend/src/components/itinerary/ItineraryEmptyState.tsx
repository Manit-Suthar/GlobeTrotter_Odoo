import React from 'react';
import { Map } from 'lucide-react';

interface ItineraryEmptyStateProps {
  onAddStop: () => void;
}

export const ItineraryEmptyState: React.FC<ItineraryEmptyStateProps> = ({ onAddStop }) => {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-12 sm:p-20 text-center flex flex-col items-center justify-center shadow-sm">
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-6">
        <Map size={36} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Your journey is waiting to be mapped.</h3>
      <p className="text-gray-500 mb-8 max-w-md text-lg">Start by adding the first stop to your trip.</p>
      
      <button 
        onClick={onAddStop}
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm transform hover:-translate-y-0.5"
      >
        + Add First Stop
      </button>
    </div>
  );
};
