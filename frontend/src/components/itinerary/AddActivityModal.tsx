import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import type { TripActivity } from '../../services/itinerary.service';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (activity: Omit<TripActivity, 'id' | 'activity_id'>) => void;
}

const mockActivities = [
  { name: 'Louvre Museum', category: 'Museum', cost: 1500, image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80', duration: '2-3 hours' },
  { name: 'Eiffel Tower Tour', category: 'Sightseeing', cost: 2500, image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=400&q=80', duration: '1-2 hours' },
  { name: 'Local Food Tasting', category: 'Food', cost: 3000, image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', duration: '3 hours' },
  { name: 'City Sightseeing Bus', category: 'Tour', cost: 1200, image_url: 'https://images.unsplash.com/photo-1496664977465-9fa8e71887e5?auto=format&fit=crop&w=400&q=80', duration: '2 hours' }
];

export const AddActivityModal: React.FC<AddActivityModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  if (!isOpen) return null;

  const filters = ['All', 'Sightseeing', 'Food', 'Museum', 'Tour'];

  const filtered = mockActivities.filter(a => {
    if (filter !== 'All' && a.category !== filter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSelect = (act: typeof mockActivities[0]) => {
    onAdd({
      custom_name: act.name,
      category: act.category,
      cost_estimate: act.cost,
      image_url: act.image_url,
      duration: act.duration,
      scheduled_time: '10:00', // default placeholder
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Add an Activity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b border-gray-100 bg-gray-50/50 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search things to do..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium shadow-sm text-gray-900 placeholder-gray-400"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  filter === f 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {filtered.length === 0 ? (
             <div className="text-center py-10 text-gray-500 font-bold">
               No activities found.
             </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(act => (
                <div key={act.name} className="flex bg-white border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow group relative pr-24">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                    <img src={act.image_url} alt={act.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center py-1">
                    <h4 className="text-base font-bold text-gray-900 leading-tight mb-1">{act.name}</h4>
                    <p className="text-sm text-gray-500 font-medium mb-1">{act.category} · {act.duration}</p>
                    <p className="text-sm font-bold text-gray-900">₹{act.cost.toLocaleString()}</p>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={() => handleSelect(act)}
                      className="px-5 py-2 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-100 hover:border-teal-600 rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
