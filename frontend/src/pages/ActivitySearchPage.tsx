import React, { useState } from 'react';
import { Search, MapPin, Tag, Clock, IndianRupee, ArrowRight, Compass } from 'lucide-react';

const mockActivities = [
  { id: 'a1', name: 'Eiffel Tower Summit', city: 'Paris', category: 'Sightseeing', duration: '2 hours', cost: 2500, image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80', rating: 'Popular' },
  { id: 'a2', name: 'Louvre Museum', city: 'Paris', category: 'Museum', duration: '3-4 hours', cost: 1500, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', rating: 'Classic' },
  { id: 'a3', name: 'Sushi Making Class', city: 'Tokyo', category: 'Food', duration: '2.5 hours', cost: 5000, image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80', rating: 'Trending' },
  { id: 'a4', name: 'Desert Safari', city: 'Dubai', category: 'Adventure', duration: '6 hours', cost: 4500, image: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=600&q=80', rating: 'Bestseller' },
  { id: 'a5', name: 'Mount Batur Sunrise', city: 'Bali', category: 'Nature', duration: '5 hours', cost: 3000, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', rating: 'Adventure' },
  { id: 'a6', name: 'Colosseum Underground', city: 'Rome', category: 'History', duration: '3 hours', cost: 2800, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80', rating: 'Must See' }
];

const categories = ['All', 'Sightseeing', 'Food', 'Adventure', 'Museum', 'History', 'Nature'];

export const ActivitySearchPage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const filtered = mockActivities.filter(a => {
    if (activeCategory !== 'All' && a.category !== activeCategory) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = (id: string) => {
    setAdded(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
       setAdded(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="bg-teal-900 text-white py-20 sm:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900 via-teal-900/60 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6">Make your trip unforgettable.</h1>
          <p className="text-xl text-teal-100 font-medium mb-10 max-w-2xl mx-auto">Discover and book the best experiences, tours, and activities for your next journey.</p>
          
          <div className="max-w-2xl mx-auto relative bg-white rounded-2xl shadow-xl flex items-center p-2 focus-within:ring-4 focus-within:ring-teal-500/30 transition-all">
            <Search className="text-gray-400 ml-3 mr-2" size={24} />
            <input 
              type="text" 
              placeholder="Search by activity, city, or interest..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 py-3 px-2 bg-transparent border-none text-gray-900 text-lg focus:outline-none placeholder-gray-400 font-medium"
            />
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        
        {/* Categories */}
        <div className="flex overflow-x-auto pb-6 mb-8 gap-3 hide-scrollbar">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                activeCategory === cat 
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
             <Compass size={48} className="mx-auto text-gray-300 mb-4" />
             <h3 className="text-2xl font-bold text-gray-900 mb-2">No activities found</h3>
             <p className="text-gray-500 font-medium">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map(act => (
              <div key={act.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img src={act.image} alt={act.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase text-teal-800 shadow-sm">
                    {act.rating}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 flex items-center text-white font-bold">
                    <MapPin size={16} className="mr-1" /> {act.city}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{act.name}</h3>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4 text-sm font-medium text-gray-600">
                    <div className="flex items-center"><Clock size={16} className="mr-1.5 text-gray-400" /> {act.duration}</div>
                    <div className="flex items-center"><Tag size={16} className="mr-1.5 text-gray-400" /> {act.category}</div>
                  </div>
                  
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                    Experience the best of {act.city} with this incredible {act.category.toLowerCase()} activity. Highly rated by travelers worldwide.
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-lg font-black text-gray-900 flex items-center">
                      <IndianRupee size={18} className="mr-0.5 text-gray-500" />
                      {act.cost.toLocaleString()}
                    </div>
                    
                    <button 
                      onClick={() => handleAdd(act.id)}
                      disabled={added[act.id]}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center ${
                        added[act.id] 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-100 hover:border-teal-600'
                      }`}
                    >
                      {added[act.id] ? '✓ Added to trip' : 'Add to Trip'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
