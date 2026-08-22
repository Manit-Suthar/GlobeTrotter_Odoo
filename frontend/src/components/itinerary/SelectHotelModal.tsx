import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Star, Loader2, BedDouble, MapPin, Check } from 'lucide-react';
import { hotelsService, type Hotel } from '../../services/hotels.service';

interface SelectHotelModalProps {
  isOpen: boolean;
  cityId?: string | null;
  cityName?: string;
  nights?: number;
  selectedHotelId?: string | null;
  onClose: () => void;
  onSelect: (hotel: Hotel) => void;
  onClear: () => void;
}

const BUDGET_FILTERS = ['All', 'low', 'moderate', 'premium', 'luxury'];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const SelectHotelModal: React.FC<SelectHotelModalProps> = ({
  isOpen, cityId, cityName, nights = 1, selectedHotelId, onClose, onSelect, onClear
}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [budget, setBudget] = useState('All');

  useEffect(() => {
    if (!isOpen || !cityId) {
      if (!isOpen) {
        setSearch('');
        setBudget('All');
      }
      return;
    }
    setLoading(true);
    hotelsService.getForCity(cityId)
      .then(data => setHotels(data))
      .catch(err => {
        console.error(err);
        setHotels([]);
      })
      .finally(() => setLoading(false));
  }, [isOpen, cityId]);

  const availableBudgets = useMemo(() => {
    const present = new Set(hotels.map(h => h.budget_category).filter(Boolean));
    return BUDGET_FILTERS.filter(b => b === 'All' || present.has(b));
  }, [hotels]);

  if (!isOpen) return null;

  const filtered = hotels.filter(h => {
    if (budget !== 'All' && h.budget_category !== budget) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${h.name} ${h.nearby_area || ''} ${h.tags || ''}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Choose where you'll stay</h3>
            {cityName && (
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                {cityName} · {nights} {nights === 1 ? 'night' : 'nights'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search hotels, areas, or amenities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium shadow-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {availableBudgets.map(b => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  budget === b
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {b === 'All' ? 'All budgets' : capitalize(b)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500 font-bold">
              <Loader2 size={20} className="animate-spin mr-2 text-teal-600" /> Loading stays...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-bold">
              No hotels found for this city.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(hotel => {
                const isSelected = hotel.id === selectedHotelId;
                return (
                  <div
                    key={hotel.id}
                    onClick={() => onSelect(hotel)}
                    className={`flex bg-white border rounded-xl p-3 cursor-pointer transition-all group ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 mr-4">
                      {hotel.image_url ? (
                        <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-teal-200"><BedDouble size={28} /></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-base font-bold text-gray-900 leading-tight">{hotel.name}</h4>
                        {isSelected && (
                          <span className="flex-shrink-0 inline-flex items-center text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                            <Check size={12} className="mr-1" strokeWidth={3} /> Selected
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-500 font-medium">
                        {hotel.hotel_type && <span className="capitalize">{hotel.hotel_type}</span>}
                        {hotel.nearby_area && (
                          <span className="inline-flex items-center"><MapPin size={13} className="mr-1 text-gray-400" />{hotel.nearby_area}</span>
                        )}
                        {hotel.rating != null && (
                          <span className="inline-flex items-center text-amber-600">
                            <Star size={13} className="fill-amber-400 text-amber-400 mr-0.5" />{hotel.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-black text-gray-900">₹{hotel.price_per_night.toLocaleString()}</span>
                        <span className="text-xs font-medium text-gray-500">/ night</span>
                        {nights > 1 && (
                          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                            ₹{(hotel.price_per_night * nights).toLocaleString()} total
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selectedHotelId && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button
              onClick={onClear}
              className="px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Remove selected stay
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
