import React, { useState, useEffect } from 'react';
import { adminService, type AdminAnalytics } from '../services/admin.service';
import { Users, Map, Activity, DollarSign, TrendingUp, ShieldAlert, BarChart } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-20 text-center animate-pulse"><div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div><div className="h-8 w-48 bg-gray-200 mx-auto rounded"></div></div>;
  }

  if (!data) return null;

  const statCards = [
    { title: 'Total Users', value: data.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Trips Created', value: data.totalTrips.toLocaleString(), icon: Map, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Activities Planned', value: data.totalActivities.toLocaleString(), icon: Activity, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Avg Trip Budget', value: `₹${data.averageTripCost.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' }
  ];

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500 bg-gray-50 min-h-screen">
      
      {/* Admin Header */}
      <div className="bg-gray-900 text-white py-12 px-4 sm:px-6 mb-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div>
              <div className="flex items-center text-red-400 font-bold text-sm tracking-widest uppercase mb-2">
                 <ShieldAlert size={16} className="mr-2" /> Administrator Access
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Platform Analytics</h1>
           </div>
           <div className="hidden sm:block opacity-20">
              <BarChart size={64} />
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           {statCards.map(s => (
             <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-5 ${s.bg} ${s.color}`}>
                   <s.icon size={24} />
                </div>
                <div>
                   <p className="text-sm font-bold text-gray-500 mb-1">{s.title}</p>
                   <p className="text-2xl font-black text-gray-900 tracking-tight">{s.value}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Popular Cities */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                 <Map size={20} className="mr-2 text-teal-600" /> Most Popular Destinations
              </h3>
              
              <div className="space-y-6">
                 {data.popularCities.map((city, idx) => (
                    <div key={city.name} className="flex items-center">
                       <div className="w-8 h-8 rounded bg-gray-100 text-gray-500 font-black flex items-center justify-center mr-4 text-sm">
                          {idx + 1}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between mb-1">
                             <span className="font-bold text-gray-900">{city.name}</span>
                             <span className="font-bold text-gray-500">{city.count} trips</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                             <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(city.count / data.popularCities[0].count) * 100}%` }}></div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* Engagement Trend */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                 <TrendingUp size={20} className="mr-2 text-purple-600" /> Weekly Engagement
              </h3>
              
              <div className="flex h-40 items-end space-x-2">
                {(data?.tripsOverTime || []).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                       <div className="opacity-0 group-hover:opacity-100 text-xs font-bold text-gray-900 mb-2 transition-opacity">{day.count}</div>
                       <div className="w-full bg-purple-100 hover:bg-purple-500 rounded-t-lg transition-colors relative" style={{ height: `${(day.count / 50) * 100}%` }}></div>
                       <div className="text-xs font-bold text-gray-400 mt-3">{day.date}</div>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};
