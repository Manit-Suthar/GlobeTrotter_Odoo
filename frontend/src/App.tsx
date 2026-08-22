import { BrowserRouter, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

const MainLayout = () => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-teal-700">GlobeTrotter</Link>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Login</Link>
            <Link to="/signup" className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 font-medium transition-colors">Sign Up</Link>
          </div>
        </nav>
      </header>
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<div className="text-center mt-12"><h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to GlobeTrotter</h1><p className="text-xl text-gray-600">Plan your multi-city trips with ease.</p></div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<div>Dashboard Placeholder</div>} />
          <Route path="/trips/new" element={<div>Create Trip Placeholder</div>} />
          <Route path="/trips/:id" element={<div>Itinerary View Placeholder</div>} />
          <Route path="/trips/:id/builder" element={<div>Itinerary Builder Placeholder</div>} />
          <Route path="/trips/:id/budget" element={<div>Budget View Placeholder</div>} />
          <Route path="/public/:token" element={<div>Public Itinerary Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
