import React, { useState, useEffect } from 'react';
import { X, Search, MapPin } from 'lucide-react';
import { citiesService, type City } from '../../services/cities.service';
import type { TripStop } from '../../services/itinerary.service';

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stop: Omit<TripStop, 'id' | 'order_index' | 'activities'>) => void;
}

export const AddStopModal: React.FC<AddStopModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      citiesService.getCities().then(data => {
        setCities(data);
        setLoading(false);
      });
    } else {
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (city: City) => {
    // Ideally user selects dates here, but to keep MVP fast, we'll assign placeholder dates 
    // that the user can edit later (or ask in the UI).
    onAdd({
      city_id: city.id,
      city_name: city.name,
      country: city.country,
      image_url: city.image_url,
      start_date: new Date().toISOString().split('T')[0], // placeholder
      end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // +3 days placeholder
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Add a Stop</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for a city..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium shadow-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500 font-bold">
              Loading destinations...
            </div>
          ) : filteredCities.length === 0 ? (
             <div className="text-center py-10 text-gray-500 font-bold">
               No cities found for "{search}"
             </div>
          ) : (
            <div className="space-y-3">
              <p className="px-3 text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Popular</p>
              {filteredCities.map(city => (
                <div 
                  key={city.id} 
                  className="flex items-center p-3 hover:bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-200 transition-all group"
                  onClick={() => handleSelect(city)}
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden mr-4">
                    {city.image_url ? (
                      <img src={city.image_url} alt={city.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100"><MapPin size={24}/></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{city.name}</h4>
                    <p className="text-sm text-gray-500 font-medium">{city.country}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-sm transition-opacity">
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
