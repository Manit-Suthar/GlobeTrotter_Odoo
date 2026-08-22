import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { TripCard } from '../components/dashboard/TripCard';
import { TripsEmptyState } from '../components/trip/TripsEmptyState';
import { TripsSkeleton } from '../components/trip/TripsSkeleton';
import { tripsService, type TripSummary } from '../services/trips.service';

export const MyTripsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const fetchedTrips = await tripsService.getTrips();
      setTrips(fetchedTrips);
    } catch (err) {
      console.error('Failed to load trips:', err);
      setError('We couldn\'t load your journeys right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Filter and segregate trips
  const { upcomingTrips, pastTrips, isSearching } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = trips.filter(trip => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        trip.name.toLowerCase().includes(q) ||
        trip.cities.some(c => c.toLowerCase().includes(q))
      );
    });

    const upcoming: TripSummary[] = [];
    const past: TripSummary[] = [];

    filtered.forEach(trip => {
      const endDate = new Date(trip.end_date);
      if (endDate >= today) {
        upcoming.push(trip);
      } else {
        past.push(trip);
      }
    });

    // Sort upcoming by nearest start date first
    upcoming.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    // Sort past by most recently ended first
    past.sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime());

    return { 
      upcomingTrips: upcoming, 
      pastTrips: past,
      isSearching: searchQuery.trim().length > 0
    };
  }, [trips, searchQuery]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Trips</h1>
            <p className="text-lg sm:text-xl text-gray-500 font-medium">Your journeys, all in one place.</p>
          </div>
        </div>
        <TripsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Something went wrong.</h3>
        <p className="text-gray-500 mb-8 text-xl font-medium">We couldn't load your journeys right now.</p>
        <button 
          onClick={fetchTrips}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-lg font-bold transition-colors shadow-sm text-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-5xl mx-auto w-full pt-4 animate-in fade-in duration-500">
        <div className="mb-12 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Trips</h1>
          <p className="text-lg sm:text-xl text-gray-500 font-medium">Your journeys, all in one place.</p>
        </div>
        <TripsEmptyState />
      </div>
    );
  }

  const hasNoResults = upcomingTrips.length === 0 && pastTrips.length === 0;

  return (
    <div className="max-w-7xl mx-auto w-full pt-4 animate-in fade-in duration-500 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">My Trips</h1>
          <p className="text-lg sm:text-xl text-gray-500 font-medium">Your journeys, all in one place.</p>
        </div>
        <Link 
          to="/create-trip"
          className="inline-flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-lg font-bold shadow-md transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Plan a New Trip</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-12 max-w-md relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search your journeys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 font-medium"
        />
      </div>

      {hasNoResults ? (
        <div className="py-24 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-5 border border-gray-100">
            <Search size={28} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No journeys found.</h3>
          <p className="text-gray-500 mb-8 text-lg font-medium">Try another trip name or destination.</p>
          <button 
            onClick={() => setSearchQuery('')}
            className="text-teal-600 font-bold hover:text-teal-700 hover:underline underline-offset-4 transition-all"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          
          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center tracking-tight">
                Upcoming Journeys
                <span className="ml-4 bg-teal-50 text-teal-700 py-1 px-3 rounded-full text-sm font-bold border border-teal-100 shadow-sm">
                  {upcomingTrips.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {upcomingTrips.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}

          {/* Past Trips */}
          {pastTrips.length > 0 && (
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center tracking-tight opacity-90">
                Past Journeys
                <span className="ml-4 bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm font-bold border border-gray-200 shadow-sm">
                  {pastTrips.length}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 opacity-85 hover:opacity-100 transition-opacity duration-300">
                {pastTrips.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
};
