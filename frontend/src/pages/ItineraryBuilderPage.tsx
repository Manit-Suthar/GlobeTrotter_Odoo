import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, Plus, MapPin } from 'lucide-react';
import { itineraryService, type Itinerary, type TripStop, type TripActivity } from '../services/itinerary.service';
import { ItinerarySkeleton } from '../components/itinerary/ItinerarySkeleton';
import { ItineraryEmptyState } from '../components/itinerary/ItineraryEmptyState';
import { StopSection } from '../components/itinerary/StopSection';
import { AddStopModal } from '../components/itinerary/AddStopModal';
import { AddActivityModal } from '../components/itinerary/AddActivityModal';
import { SelectHotelModal } from '../components/itinerary/SelectHotelModal';
import type { Hotel } from '../services/hotels.service';

export const ItineraryBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals state
  const [showAddStop, setShowAddStop] = useState(false);
  const [activeStopIdForActivity, setActiveStopIdForActivity] = useState<string | null>(null);
  const [activeStopIdForHotel, setActiveStopIdForHotel] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    itineraryService.getItinerary(id)
      .then(data => setItinerary(data))
      .catch(err => {
        console.error(err);
        setError('We couldn\'t load your itinerary.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!itinerary) return;
    setIsSaving(true);
    try {
      await itineraryService.saveItinerary(itinerary);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const markDirty = (newItinerary: Itinerary) => {
    setItinerary(newItinerary);
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  // --- Handlers for Stops ---
  const handleAddStop = (stopData: Omit<TripStop, 'id' | 'order_index' | 'activities'>) => {
    if (!itinerary) return;
    const newStop: TripStop = {
      ...stopData,
      id: `stop-${Date.now()}`,
      order_index: itinerary.stops.length,
      activities: []
    };
    markDirty({
      ...itinerary,
      stops: [...itinerary.stops, newStop]
    });
    setShowAddStop(false);
  };

  const handleRemoveStop = (stopId: string) => {
    if (!itinerary) return;
    markDirty({
      ...itinerary,
      stops: itinerary.stops.filter(s => s.id !== stopId)
    });
  };

  // --- Handlers for Hotels ---
  const handleSelectHotel = (hotel: Hotel) => {
    if (!itinerary || !activeStopIdForHotel) return;
    const updatedStops = itinerary.stops.map(stop =>
      stop.id === activeStopIdForHotel
        ? { ...stop, hotel_id: hotel.id, hotel }
        : stop
    );
    markDirty({ ...itinerary, stops: updatedStops });
    setActiveStopIdForHotel(null);
  };

  const handleClearHotel = () => {
    if (!itinerary || !activeStopIdForHotel) return;
    const updatedStops = itinerary.stops.map(stop =>
      stop.id === activeStopIdForHotel
        ? { ...stop, hotel_id: null, hotel: null }
        : stop
    );
    markDirty({ ...itinerary, stops: updatedStops });
    setActiveStopIdForHotel(null);
  };

  // --- Handlers for Activities ---
  const handleAddActivity = (activityData: Omit<TripActivity, 'id'>) => {
    if (!itinerary || !activeStopIdForActivity) return;

    const newActivity: TripActivity = {
      ...activityData,
      id: `act-${Date.now()}`,
      activity_id: activityData.activity_id || `sys-${Date.now()}`
    };

    const updatedStops = itinerary.stops.map(stop => {
      if (stop.id === activeStopIdForActivity) {
        return {
          ...stop,
          activities: [...stop.activities, newActivity]
        };
      }
      return stop;
    });

    markDirty({ ...itinerary, stops: updatedStops });
    setActiveStopIdForActivity(null);
  };

  const handleRemoveActivity = (stopId: string, activityId: string) => {
    if (!itinerary) return;
    const updatedStops = itinerary.stops.map(stop => {
      if (stop.id === stopId) {
        return {
          ...stop,
          activities: stop.activities.filter(a => a.id !== activityId)
        };
      }
      return stop;
    });
    markDirty({ ...itinerary, stops: updatedStops });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto w-full pt-4 px-4 sm:px-6 lg:px-8">
        <ItinerarySkeleton />
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Something went wrong.</h3>
        <p className="text-gray-500 mb-8 text-xl font-medium">{error}</p>
        <Link to="/my-trips" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-lg font-bold transition-colors shadow-sm text-lg">
          Back to My Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pt-4 animate-in fade-in duration-500 pb-32">
      
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md pb-6 pt-4 border-b border-gray-200 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <Link to="/my-trips" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-teal-600 transition-colors mb-3">
            <ArrowLeft size={16} className="mr-1.5" /> Back to My Trips
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">{itinerary.name}</h1>
          <p className="text-lg text-gray-600 font-medium mt-1">
            {new Date(itinerary.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(itinerary.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} 
            <span className="mx-2 text-gray-300">•</span> 
            {itinerary.duration_days} days
            <span className="mx-2 text-gray-300">•</span> 
            {itinerary.stops.length} {itinerary.stops.length === 1 ? 'city' : 'cities'}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && !isSaving && (
            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-in fade-in">
              Unsaved changes
            </span>
          )}
          {saveSuccess && !hasUnsavedChanges && (
            <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 animate-in fade-in">
              Saved
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold transition-all shadow-sm ${
              hasUnsavedChanges && !isSaving
                ? 'bg-teal-600 hover:bg-teal-700 text-white transform hover:-translate-y-0.5' 
                : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <><Loader2 size={18} className="animate-spin mr-2" /> Saving...</>
            ) : (
              <><Save size={18} className="mr-2" /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-2 sm:px-4">
        {itinerary.stops.length === 0 ? (
          <ItineraryEmptyState onAddStop={() => setShowAddStop(true)} />
        ) : (
          <div className="space-y-0">
            {itinerary.stops.map((stop, index) => (
              <StopSection 
                key={stop.id}
                stop={stop}
                isFirst={index === 0}
                isLast={index === itinerary.stops.length - 1}
                onRemoveStop={handleRemoveStop}
                onAddActivity={(stopId) => setActiveStopIdForActivity(stopId)}
                onSelectHotel={(stopId) => setActiveStopIdForHotel(stopId)}
                onRemoveActivity={handleRemoveActivity}
              />
            ))}
            
            <div className="pt-8 flex relative">
               <div className="mr-4 sm:mr-8 flex flex-col items-center">
                 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 z-10 shadow-inner">
                   <MapPin size={14} />
                 </div>
               </div>
               <div className="flex-1">
                 <button 
                   onClick={() => setShowAddStop(true)}
                   className="inline-flex items-center justify-center px-8 py-4 border-2 border-dashed border-gray-200 text-lg font-bold rounded-2xl text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition-colors w-full sm:w-auto"
                 >
                   <Plus size={22} className="mr-2" strokeWidth={2.5} />
                   Add Another Stop
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddStopModal 
        isOpen={showAddStop} 
        onClose={() => setShowAddStop(false)} 
        onAdd={handleAddStop} 
      />
      <AddActivityModal
        isOpen={activeStopIdForActivity !== null}
        cityId={itinerary.stops.find(s => s.id === activeStopIdForActivity)?.city_id ?? null}
        onClose={() => setActiveStopIdForActivity(null)}
        onAdd={handleAddActivity}
      />
      {(() => {
        const hotelStop = itinerary.stops.find(s => s.id === activeStopIdForHotel);
        return (
          <SelectHotelModal
            isOpen={activeStopIdForHotel !== null}
            cityId={hotelStop?.city_id ?? null}
            cityName={hotelStop?.city_name}
            nights={hotelStop ? Math.max(Math.round((new Date(hotelStop.end_date).getTime() - new Date(hotelStop.start_date).getTime()) / 86400000), 1) : 1}
            selectedHotelId={hotelStop?.hotel_id ?? null}
            onClose={() => setActiveStopIdForHotel(null)}
            onSelect={handleSelectHotel}
            onClear={handleClearHotel}
          />
        );
      })()}

    </div>
  );
};
