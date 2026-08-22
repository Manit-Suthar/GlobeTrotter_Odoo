import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bell, Menu, X, Compass, Map, Home, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const userName = user?.name || 'Traveler';
  const userInitials = userName.charAt(0).toUpperCase();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
    { name: 'My Trips', path: '/my-trips', icon: <Map size={18} /> },
    { name: 'Explore', path: '/explore', icon: <Compass size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Desktop Nav */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-teal-800 tracking-tight">GlobeTrotter</span>
              </Link>
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      location.pathname.startsWith(link.path)
                        ? 'border-teal-600 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right side icons */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                <Bell size={20} />
              </button>
              
              <div className="relative ml-2 group">
                <div className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm border border-teal-100">
                    {userInitials}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden xl:block">{userName}</span>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 hidden group-hover:block transition-all duration-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    Your Profile
                  </Link>
                  <button 
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white absolute w-full shadow-lg">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium ${
                    location.pathname.startsWith(link.path)
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">{link.icon}</span>
                    <span>{link.name}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-5 border-t border-gray-100">
              <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold border border-teal-100">
                    {userInitials}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{userName}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </Link>
              <button 
                onClick={() => logout()}
                className="mt-2 w-full flex items-center px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto pb-12 sm:pb-16 pt-6 sm:pt-8 lg:pt-10 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
