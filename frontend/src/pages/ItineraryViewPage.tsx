import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Share2, AlertCircle, LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { itineraryService, type Itinerary } from '../services/itinerary.service';
import { ItineraryViewSkeleton } from '../components/itinerary/ItineraryViewSkeleton';
import { CityJourneySection } from '../components/itinerary/CityJourneySection';
import { ItineraryCalendar } from '../components/itinerary/ItineraryCalendar';

export const ItineraryViewPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    itineraryService.getItinerary(id)
      .then(data => setItinerary(data))
      .catch(err => {
        console.error(err);
        setError('Something went wrong while loading this journey.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ItineraryViewSkeleton />;

  if (error || !itinerary) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{error}</h3>
        <Link to="/my-trips" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-lg mt-4">
          Back to My Trips
        </Link>
      </div>
    );
  }

  const citiesPath = itinerary.stops.map(s => s.city_name).join(' → ');
  const totalCost = itinerary.stops.reduce((acc, stop) => {
    return acc + stop.activities.reduce((sum, act) => sum + act.cost_estimate, 0);
  }, 0);

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500">
      
      {/* Top Action Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/my-trips" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-teal-600 transition-colors">
          <ArrowLeft size={16} className="mr-1.5" /> Back to My Trips
        </Link>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <Share2 size={16} className="mr-2" /> Share
          </button>
          <Link to={`/trips/${id}/builder`} className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm">
            <Edit3 size={16} className="mr-2" /> Edit Itinerary
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Trip Hero */}
        <div className="relative w-full h-[350px] sm:h-[480px] rounded-[2rem] overflow-hidden mb-12 shadow-sm group">
          {itinerary.cover_image ? (
            <img src={itinerary.cover_image} alt={itinerary.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-teal-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 text-white">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-4 leading-none uppercase">{itinerary.name}</h1>
            <p className="text-lg sm:text-xl font-bold text-white/90 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>{new Date(itinerary.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(itinerary.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
              <span className="hidden sm:inline text-white/40 font-light">|</span>
              <span>{itinerary.duration_days} days</span>
              <span className="hidden sm:inline text-white/40 font-light">|</span>
              <span>{itinerary.stops.length} {itinerary.stops.length === 1 ? 'city' : 'cities'}</span>
            </p>
          </div>
        </div>

        {itinerary.stops.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center shadow-sm py-24">
            <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your journey is still a blank canvas.</h3>
            <p className="text-gray-500 mb-10 max-w-md text-lg font-medium">Start adding destinations and activities to bring this trip to life.</p>
            <Link to={`/trips/${id}/builder`} className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm">
              Build Itinerary
            </Link>
          </div>
        ) : (
          <>
            {/* Journey Summary & Toggle */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 bg-gray-50/80 p-6 sm:p-8 rounded-[2rem] border border-gray-100">
              <div className="mb-6 md:mb-0">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">The Route</p>
                <p className="text-xl sm:text-2xl font-black text-teal-900 tracking-tighter uppercase">{citiesPath}</p>
              </div>
              
              <div className="flex bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <LayoutList size={18} className="mr-2" /> List View
                </button>
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center transition-colors ${viewMode === 'calendar' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <CalendarIcon size={18} className="mr-2" /> Calendar
                </button>
              </div>
            </div>

            {/* Main View Area */}
            {viewMode === 'calendar' ? (
              <ItineraryCalendar itinerary={itinerary} />
            ) : (
              <div className="space-y-4">
                {itinerary.stops.map((stop, idx) => (
                  <CityJourneySection 
                    key={stop.id} 
                    stop={stop} 
                    isLast={idx === itinerary.stops.length - 1} 
                  />
                ))}
              </div>
            )}
            
            {/* Budget Preview Snippet */}
            {totalCost > 0 && (
              <div className="mt-20 bg-gray-900 rounded-[2rem] p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                   <div className="w-64 h-64 bg-teal-400 rounded-full filter blur-3xl mix-blend-screen"></div>
                </div>
                <div className="relative z-10 w-full text-center sm:text-left">
                  <p className="text-sm font-black text-teal-400 uppercase tracking-widest mb-3">Trip Estimate</p>
                  <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-2">₹{totalCost.toLocaleString()}</h3>
                  <p className="text-gray-400 font-medium">Total estimated cost for planned activities.</p>
                </div>
                <div className="relative z-10 mt-8 sm:mt-0 w-full sm:w-auto">
                   <Link to={`/trips/${id}/budget`} className="w-full sm:w-auto inline-block text-center px-8 py-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                     View Full Budget
                   </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
