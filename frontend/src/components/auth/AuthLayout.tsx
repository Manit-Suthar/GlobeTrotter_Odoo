import React, { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  imageUrl?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  // Default fallback image - scenic mountain lake
  imageUrl = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
}) => {
  return (
    <div className="min-h-screen w-full flex bg-[#FDFBF7]">
      {/* Left side: Travel Visual (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        <div className="absolute inset-0 bg-black/20 z-10 transition-opacity"></div>
        <img
          src={imageUrl}
          alt="Scenic travel destination"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle gradient overlay at the bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
        
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 xl:p-20 text-white">
          <div className="mb-6 max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-4">GlobeTrotter</h1>
            <p className="text-xl opacity-90 font-medium leading-relaxed">
              Plan the journey. Live the adventure.
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 xl:p-24 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden mb-10 text-center">
            <h1 className="text-3xl font-bold text-teal-800 tracking-tight">GlobeTrotter</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
