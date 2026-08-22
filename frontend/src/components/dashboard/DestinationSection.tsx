import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DestinationCard } from './DestinationCard';
import { type City } from '../../services/cities.service';

interface DestinationSectionProps {
  cities: City[];
}

export const DestinationSection: React.FC<DestinationSectionProps> = ({ cities }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (cities.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Explore Destinations</h2>
          <p className="text-gray-500 mt-1 font-medium">Discover popular spots for your next trip</p>
        </div>
        
        <div className="hidden md:flex items-center space-x-3">
          <button 
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Horizontal scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="flex space-x-5 overflow-x-auto pb-6 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          /* Hide scrollbar for Chrome, Safari and Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
        {cities.map(city => (
          <div key={city.id} className="snap-start">
            <DestinationCard city={city} />
          </div>
        ))}
      </div>
    </div>
  );
};
