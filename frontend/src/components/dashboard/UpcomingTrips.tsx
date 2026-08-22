import React from 'react';
import { TripCard } from './TripCard';
import { DashboardEmptyState } from './DashboardEmptyState';
import { type TripSummary } from '../../services/trips.service';

interface UpcomingTripsProps {
  trips: TripSummary[];
}

export const UpcomingTrips: React.FC<UpcomingTripsProps> = ({ trips }) => {
  if (trips.length === 0) {
    return <DashboardEmptyState />;
  }

  return (
    <div className="mb-14">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Upcoming Trips</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
};
