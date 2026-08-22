import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface WelcomeHeroProps {
  userName?: string;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({ userName }) => {
  const greetingName = userName || 'Traveler';

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-sm mb-12">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80"
          alt="Travel exploration landscape"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent"></div>
      </div>

      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 md:py-20 lg:px-16 flex flex-col md:flex-row items-center md:items-start justify-between">
        <div className="text-white max-w-xl mb-8 md:mb-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Welcome, {greetingName}
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 font-medium mb-10 leading-relaxed">
            Where will your next adventure take you?
          </p>

          <Link
            to="/create-trip"
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-500 text-white px-7 py-3.5 rounded-lg font-semibold shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Plan a New Trip</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
