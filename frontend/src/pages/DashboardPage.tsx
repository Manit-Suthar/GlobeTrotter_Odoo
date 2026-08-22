import React, { useState, useEffect } from 'react';
import { WelcomeHero } from '../components/dashboard/WelcomeHero';
import { UpcomingTrips } from '../components/dashboard/UpcomingTrips';
import { DestinationSection } from '../components/dashboard/DestinationSection';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { tripsService, type TripSummary } from '../services/trips.service';
import { citiesService, type City } from '../services/cities.service';
import { AlertCircle } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [fetchedTrips, fetchedCities] = await Promise.all([
        tripsService.getTrips(),
        citiesService.getCities()
      ]);
      setTrips(fetchedTrips);
      setCities(fetchedCities);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('We couldn\'t load your journeys right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong.</h3>
        <p className="text-gray-500 mb-8 text-lg">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const totalEstimatedCost = trips.reduce((sum, trip) => sum + (trip.estimated_cost || 0), 0);

  return (
    <div className="animate-in fade-in duration-500">
      <WelcomeHero userName={user?.name || 'Traveler'} />
      
      {/* Optional Budget Highlight - lightweight travel info */}
      {totalEstimatedCost > 0 && (
        <div className="mb-10 bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated Travel Budget</h3>
            <div className="text-2xl font-bold text-gray-900">₹{totalEstimatedCost.toLocaleString('en-IN')}</div>
          </div>
          <div className="mt-4 sm:mt-0 text-left sm:text-right">
            <div className="text-sm text-gray-500 mb-2">Across {trips.length} upcoming trips</div>
            <div className="w-full sm:w-48 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full w-[70%]"></div>
            </div>
          </div>
        </div>
      )}

      <UpcomingTrips trips={trips} />
      
      <DestinationSection cities={cities} />
    </div>
  );
};
