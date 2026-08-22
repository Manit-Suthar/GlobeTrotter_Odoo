import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Wallet, AlertCircle, Plane, Home, Activity, Coffee, TrendingUp } from 'lucide-react';
import { budgetService, type TripBudget } from '../services/budget.service';
import { itineraryService, type Itinerary } from '../services/itinerary.service';

export const BudgetPage = () => {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<TripBudget | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      budgetService.getBudget(id),
      itineraryService.getItinerary(id)
    ])
    .then(([bData, iData]) => {
      setBudget(bData);
      setItinerary(iData);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-10 w-32 bg-gray-200 rounded mb-8"></div>
        <div className="w-full h-[400px] bg-gray-200 rounded-[2rem] mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="h-64 bg-gray-200 rounded-[2rem]"></div>
           <div className="h-64 bg-gray-200 rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  if (!budget || !itinerary) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center px-4">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-3xl font-black text-gray-900 mb-2">Failed to load budget</h2>
        <Link to={`/trips/${id}`} className="text-teal-600 font-bold hover:underline">Return to Itinerary</Link>
      </div>
    );
  }

  const catDetails = [
    { key: 'transport', label: 'Transport', icon: Plane, color: 'bg-blue-500' },
    { key: 'accommodation', label: 'Accommodation', icon: Home, color: 'bg-purple-500' },
    { key: 'activities', label: 'Activities', icon: Activity, color: 'bg-teal-500' },
    { key: 'meals', label: 'Meals', icon: Coffee, color: 'bg-orange-500' }
  ];

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link to={`/trips/${id}`} className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-teal-600 transition-colors mb-8">
          <ArrowLeft size={16} className="mr-1.5" /> Back to {itinerary.name}
        </Link>
        
        {/* Budget Hero */}
        <div className="bg-gray-900 rounded-[2rem] p-8 sm:p-16 text-white relative overflow-hidden shadow-xl mb-12">
          {/* Abstract background blobs */}
          <div className="absolute top-0 right-0 p-12 opacity-30">
            <div className="w-96 h-96 bg-teal-500 rounded-full filter blur-[100px] mix-blend-screen transform translate-x-1/3 -translate-y-1/3"></div>
          </div>
          <div className="absolute bottom-0 left-0 p-12 opacity-20">
            <div className="w-80 h-80 bg-purple-500 rounded-full filter blur-[80px] mix-blend-screen transform -translate-x-1/3 translate-y-1/3"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/10">
               <Wallet size={16} className="mr-2 text-teal-300" />
               <span className="text-sm font-bold tracking-widest uppercase text-teal-100">Budget Projection</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-medium text-gray-300 mb-2">Estimated cost for</h1>
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter mb-12 text-white">{itinerary.name}</h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-x-12 gap-y-6 border-t border-white/10 pt-10">
               <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Total Estimate</p>
                  <p className="text-5xl sm:text-6xl font-black text-white tracking-tighter">₹{budget.total.toLocaleString()}</p>
               </div>
               <div className="pb-2">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Daily Average</p>
                  <p className="text-2xl sm:text-3xl font-bold text-teal-300">₹{budget.daily_average.toLocaleString()} / day</p>
               </div>
            </div>
          </div>
        </div>

        {/* Budget Breakdown & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Category Breakdown */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 sm:p-10 shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight flex items-center">
               Cost Breakdown
            </h3>
            
            <div className="space-y-8">
              {catDetails.map(cat => {
                const amount = budget.by_category[cat.key] || 0;
                const percentage = Math.round((amount / budget.total) * 100);
                const Icon = cat.icon;
                
                return (
                  <div key={cat.key}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${cat.color} bg-opacity-10 text-gray-800`}>
                            <Icon size={20} className="opacity-80" />
                         </div>
                         <div>
                            <p className="font-bold text-gray-900">{cat.label}</p>
                            <p className="text-sm font-medium text-gray-400">{percentage}% of total</p>
                         </div>
                      </div>
                      <div className="text-xl font-black text-gray-900">
                        ₹{amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mt-3">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Distribution / Insights */}
          <div className="space-y-8">
            <div className="bg-orange-50 rounded-[2rem] border border-orange-100 p-8 sm:p-10 shadow-sm relative overflow-hidden">
               <TrendingUp size={120} className="absolute -bottom-6 -right-6 text-orange-500 opacity-5" />
               <h3 className="text-2xl font-black text-orange-900 mb-4 tracking-tight">Budget Insights</h3>
               <p className="text-orange-800/80 font-medium text-lg leading-relaxed mb-6">
                 Based on your current itinerary, <strong className="font-bold text-orange-900">Accommodation</strong> is your highest expense taking up {Math.round((budget.by_category.accommodation / budget.total) * 100)}% of your budget. 
               </p>
               <div className="bg-white/60 p-4 rounded-xl border border-orange-200/50 flex items-start">
                 <AlertCircle size={20} className="text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
                 <p className="text-sm font-medium text-orange-900">Consider exploring alternative lodging options in Tokyo to bring this category below 30% of total.</p>
               </div>
            </div>

            <div className="bg-gray-900 rounded-[2rem] p-8 sm:p-10 shadow-sm text-white">
               <h3 className="text-xl font-black text-gray-300 mb-2 tracking-tight">Daily Target Status</h3>
               <p className="text-3xl font-black text-white mb-8 tracking-tighter">On Track</p>
               
               <div className="flex items-end gap-2 h-32 w-full pt-4 border-t border-gray-800">
                  {/* Mock bar chart for daily spend */}
                  {[60, 80, 110, 90, 70, 85, 40, 50].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                       <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-white text-gray-900 text-xs font-bold py-1 px-2 rounded whitespace-nowrap transition-opacity">Day {i+1}</div>
                       <div className={`w-full rounded-t-sm transition-colors ${h > 100 ? 'bg-orange-500' : 'bg-teal-500 group-hover:bg-teal-400'}`} style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                 <span>Day 1</span>
                 <span>Day 8</span>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
