import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { MyTripsPage } from './pages/MyTripsPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboard Routes (Authenticated) */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Navigation Placeholders */}
          <Route path="/my-trips" element={<MyTripsPage />} />
          <Route path="/explore" element={<div>Explore Placeholder</div>} />
          <Route path="/create-trip" element={<CreateTripPage />} />
          
          {/* Future Trip Sub-routes */}
          <Route path="/trips/:id" element={<div>Itinerary View Placeholder</div>} />
          <Route path="/trips/:id/builder" element={<div>Itinerary Builder Placeholder</div>} />
          <Route path="/trips/:id/budget" element={<div>Budget View Placeholder</div>} />
        </Route>
        
        {/* Public Routes */}
        <Route path="/public/:token" element={<div>Public Itinerary Placeholder</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
