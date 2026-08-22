import React, { useEffect, useState } from 'react';
import { X, Loader2, MapPin, Calendar, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { tripsService, type TripSummary } from '../../services/trips.service';
import { itineraryService, type TripStop } from '../../services/itinerary.service';
import type { CatalogActivity } from '../../services/activities.service';

interface AddToTripModalProps {
  isOpen: boolean;
  activity: CatalogActivity | null;
  onClose: () => void;
  onAdded: (activityId: string) => void;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({ isOpen, activity, onClose, onAdded }) => {
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripSummary | null>(null);
  const [stops, setStops] = useState<TripStop[]>([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedTrip(null);
      setStops([]);
      setError('');
      return;
    }
    setLoadingTrips(true);
    tripsService.getTrips()
      .then(data => setTrips(data))
      .catch(err => {
        console.error(err);
        setError('Could not load your trips. Please make sure you are signed in.');
      })
      .finally(() => setLoadingTrips(false));
  }, [isOpen]);

  useEffect(() => {
    if (!selectedTrip) return;
    setLoadingStops(true);
    setError('');
    itineraryService.getItinerary(selectedTrip.id)
      .then(data => setStops(data.stops))
      .catch(err => {
        console.error(err);
        setError('Could not load the stops for this trip.');
      })
      .finally(() => setLoadingStops(false));
  }, [selectedTrip]);

  if (!isOpen || !activity) return null;

  const handleAddToStop = async (stop: TripStop) => {
    setSaving(stop.id);
    setError('');
    try {
      await itineraryService.addActivityToStop(stop.id, {
        activity_id: activity.id,
        custom_name: activity.name,
        cost_estimate: activity.default_cost,
        scheduled_date: stop.start_date,
      });
      onAdded(activity.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Could not add this activity. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">

        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            {selectedTrip && (
              <button
                onClick={() => { setSelectedTrip(null); setStops([]); }}
                className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {selectedTrip ? 'Pick a stop' : 'Add to which trip?'}
              </h3>
              <p className="text-sm text-gray-500 font-medium truncate">
                {selectedTrip ? selectedTrip.name : activity.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 mb-4 text-sm font-medium">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!selectedTrip ? (
            loadingTrips ? (
              <div className="flex items-center justify-center py-12 text-gray-500 font-bold">
                <Loader2 size={20} className="animate-spin mr-2 text-teal-600" /> Loading your trips...
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-bold">
                You don't have any trips yet. Create one first.
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map(trip => (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className="w-full text-left flex items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-teal-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 truncate">{trip.name}</h4>
                      <p className="text-sm text-gray-500 font-medium inline-flex items-center mt-0.5">
                        <Calendar size={13} className="mr-1.5 text-gray-400" />
                        {new Date(trip.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        {' — '}
                        {new Date(trip.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : loadingStops ? (
            <div className="flex items-center justify-center py-12 text-gray-500 font-bold">
              <Loader2 size={20} className="animate-spin mr-2 text-teal-600" /> Loading stops...
            </div>
          ) : stops.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-bold">
              This trip has no stops yet. Add a city in the itinerary builder first.
            </div>
          ) : (
            <div className="space-y-3">
              {stops.map(stop => {
                const isMatch = stop.city_name.toLowerCase() === activity.city.toLowerCase();
                return (
                  <button
                    key={stop.id}
                    onClick={() => handleAddToStop(stop)}
                    disabled={saving !== null}
                    className={`w-full text-left flex items-center p-4 bg-white border rounded-xl transition-all disabled:opacity-60 ${
                      isMatch ? 'border-teal-200 bg-teal-50/40 hover:border-teal-400' : 'border-gray-100 hover:border-gray-300'
                    } hover:shadow-md`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 inline-flex items-center">
                        <MapPin size={14} className="mr-1.5 text-teal-600" />
                        {stop.city_name}
                        {isMatch && (
                          <span className="ml-2 text-xs font-black uppercase tracking-wider text-teal-700">Same city</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500 font-medium mt-0.5">
                        {new Date(stop.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        {' — '}
                        {new Date(stop.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        {' · '}{stop.activities.length} {stop.activities.length === 1 ? 'activity' : 'activities'}
                      </p>
                    </div>
                    {saving === stop.id ? (
                      <Loader2 size={18} className="animate-spin text-teal-600 flex-shrink-0" />
                    ) : (
                      <Check size={18} className="text-gray-300 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
