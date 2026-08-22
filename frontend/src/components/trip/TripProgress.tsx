import React from 'react';

export const TripProgress: React.FC = () => {
  const steps = [
    { id: 1, name: 'Trip Details', status: 'current' },
    { id: 2, name: 'Destinations', status: 'upcoming' },
    { id: 3, name: 'Itinerary', status: 'upcoming' },
  ];

  return (
    <div className="py-6 sm:py-8 border-b border-gray-100 mb-8 sm:mb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'w-full pr-8 sm:pr-20' : ''}`}>
                <div className="flex items-center">
                  <div 
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      step.status === 'current' 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    <span className="text-sm font-semibold">{step.id}</span>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-8 -right-8 sm:-right-20 h-0.5 bg-gray-200" />
                  )}
                </div>
                <div className="absolute top-10 w-32 -left-12 text-center">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    step.status === 'current' ? 'text-teal-700' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
};
