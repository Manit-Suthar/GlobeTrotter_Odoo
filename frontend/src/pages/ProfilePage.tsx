import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Mail, User as UserIcon, Globe2, MapPin, Trash2, Save, LogOut, ArrowRight } from 'lucide-react';
import { userService, type UserProfile } from '../services/user.service';
import { useAuth } from '../contexts/AuthContext';

export const ProfilePage = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');

  useEffect(() => {
    userService.getMe()
      .then(data => {
         setUser(data);
         setName(data.name);
         setLanguage(data.language || 'English');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateMe({ name, language });
      setUser(updated);
      // Optional: Add toast success here
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Delete your account? This action cannot be undone.")) {
      userService.deleteAccount().then(() => {
         // navigate to login or show deleted state
         window.location.href = '/login';
      });
    }
  };

  if (loading) {
    return <div className="p-20 text-center animate-pulse"><div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div><div className="h-8 w-48 bg-gray-200 mx-auto rounded"></div></div>;
  }

  if (!user) return null;

  return (
    <div className="w-full pb-32 animate-in fade-in duration-500">
      
      {/* Profile Header Background */}
      <div className="h-64 bg-gray-900 w-full relative">
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-teal-900/40"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-24 relative z-10">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-12 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-8 text-center sm:text-left">
           <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600">
                     <UserIcon size={48} />
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 sm:bottom-2 sm:right-2 bg-gray-900 text-white p-2.5 rounded-full shadow-lg hover:bg-teal-600 transition-colors">
                <Camera size={18} />
              </button>
           </div>
           
           <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter mb-1">{user.name}</h1>
              <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start">
                 <Mail size={16} className="mr-2 opacity-50" /> {user.email}
              </p>
           </div>
           
           <div>
             <button 
               onClick={logout}
               className="flex items-center px-6 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
             >
               <LogOut size={16} className="mr-2 opacity-70" /> Sign Out
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           
           {/* Form Column */}
           <div className="md:col-span-2 space-y-8">
             <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-10">
               <h3 className="text-xl font-black text-gray-900 mb-6">Personal Information</h3>
               
               <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                   <input 
                     type="text"
                     value={name}
                     onChange={e => setName(e.target.value)}
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium text-gray-900"
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                   <input 
                     type="email"
                     value={user.email}
                     disabled
                     className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none font-medium cursor-not-allowed"
                   />
                   <p className="text-xs text-gray-400 mt-2 font-medium">Email cannot be changed directly.</p>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 sm:p-10">
               <h3 className="text-xl font-black text-gray-900 mb-6">Preferences</h3>
               <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
                   <div className="relative">
                     <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     <select 
                       value={language}
                       onChange={e => setLanguage(e.target.value)}
                       className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all font-medium text-gray-900 appearance-none bg-white"
                     >
                       <option value="English">English</option>
                       <option value="Spanish">Spanish</option>
                       <option value="French">French</option>
                       <option value="Japanese">Japanese</option>
                     </select>
                   </div>
               </div>
             </div>

             <div className="flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-8 py-3.5 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-70"
                >
                   {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Changes</>}
                </button>
             </div>
           </div>

           {/* Sidebar Column */}
           <div className="space-y-8">
             
             {/* Saved Destinations */}
             <div className="bg-teal-50 rounded-[2rem] border border-teal-100 p-8">
               <h3 className="text-xl font-black text-teal-900 mb-6 flex items-center">
                 <MapPin className="mr-2 text-teal-600" size={20} /> Saved Cities
               </h3>
               
               {(!user.saved_destinations || user.saved_destinations.length === 0) ? (
                 <p className="text-teal-700/60 font-medium text-sm">No saved destinations yet.</p>
               ) : (
                 <div className="space-y-3">
                   {user.saved_destinations.map((cityId, i) => (
                      <div key={i} className="bg-white px-4 py-3 rounded-xl shadow-sm border border-teal-100 flex items-center justify-between group cursor-pointer hover:border-teal-300 transition-colors">
                        <span className="font-bold text-teal-900">City {cityId.replace('city-', '')}</span>
                        <ArrowRight size={16} className="text-teal-300 group-hover:text-teal-600 transition-colors" />
                      </div>
                   ))}
                 </div>
               )}
               <Link to="/search" className="block mt-6 text-center text-sm font-bold text-teal-700 hover:text-teal-800 underline">
                 Discover more
               </Link>
             </div>

             {/* Danger Zone */}
             <div className="bg-red-50 rounded-[2rem] border border-red-100 p-8">
               <h3 className="text-lg font-black text-red-900 mb-2">Danger Zone</h3>
               <p className="text-red-700/70 text-sm font-medium mb-6">Once you delete your account, there is no going back. Please be certain.</p>
               <button 
                 onClick={handleDelete}
                 className="w-full flex justify-center items-center px-4 py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-colors"
               >
                 <Trash2 size={16} className="mr-2" /> Delete Account
               </button>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
};
