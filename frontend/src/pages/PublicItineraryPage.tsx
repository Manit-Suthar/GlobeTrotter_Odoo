import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Share2, Globe, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';
import { itineraryService, type Itinerary } from '../services/itinerary.service';
import { CityJourneySection } from '../components/itinerary/CityJourneySection';
import { ItineraryViewSkeleton } from '../components/itinerary/ItineraryViewSkeleton';

// Note: In a real app this would hit a public unauthenticated endpoint.
// For the hackathon, we reuse the mock itinerary service.
export const PublicItineraryPage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // For demo, we just strip 'public-' prefix and load the trip.
    const tripId = shareId?.replace('public-', '') || 'trip-1';
    
    setLoading(true);
    itineraryService.getItinerary(tripId)
      .then(setItinerary)
      .catch(() => setError('This itinerary is not publicly available.'))
      .finally(() => setLoading(false));
  }, [shareId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <ItineraryViewSkeleton />;

  if (error || !itinerary) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center px-4">
        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-3xl font-black text-gray-900 mb-2">{error}</h2>
      </div>
    );
  }

  const citiesPath = itinerary.stops.map(s => s.city_name).join(' → ');

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500 bg-gray-50/50 min-h-screen">
      
      {/* Brand Header for Public Pages */}
      <div className="bg-white border-b border-gray-100 py-4 px-6 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link to="/" className="text-xl font-black text-gray-900 tracking-tighter flex items-center">
          <Globe className="text-teal-600 mr-2" size={24} />
          GlobeTrotter
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
          >
            {copied ? <CheckCircle2 size={16} className="mr-2 text-green-600" /> : <Copy size={16} className="mr-2" />} 
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <button className="inline-flex items-center justify-center px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm">
            Copy Trip
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12">
        {/* Public Trip Hero */}
        <div className="relative w-full h-[400px] sm:h-[550px] rounded-[2rem] overflow-hidden mb-16 shadow-xl">
          {itinerary.cover_image ? (
            <img src={itinerary.cover_image} alt={itinerary.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-teal-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10"></div>
          
          <div className="absolute top-8 left-8 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold tracking-widest uppercase flex items-center shadow-lg">
             <Share2 size={14} className="mr-2" /> Shared Itinerary
          </div>

          <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 text-white">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 leading-none uppercase">{itinerary.name}</h1>
            <p className="text-xl sm:text-2xl font-bold text-white/90 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>{new Date(itinerary.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(itinerary.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
            </p>
          </div>
        </div>

        {/* Route Summary */}
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-gray-100 shadow-sm mb-12">
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">The Route</p>
          <p className="text-2xl sm:text-3xl font-black text-teal-900 tracking-tighter uppercase">{citiesPath}</p>
        </div>

        {/* Journey Timeline */}
        <div className="bg-white p-6 sm:p-12 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="space-y-4">
            {itinerary.stops.map((stop, idx) => (
              <CityJourneySection 
                key={stop.id} 
                stop={stop} 
                isLast={idx === itinerary.stops.length - 1} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
