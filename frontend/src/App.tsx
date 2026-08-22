import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { ItineraryBuilderPage } from './pages/ItineraryBuilderPage';
import { ItineraryViewPage } from './pages/ItineraryViewPage';
import { BudgetPage } from './pages/BudgetPage';
import { TripCalendarPage } from './pages/TripCalendarPage';
import { ActivitySearchPage } from './pages/ActivitySearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PublicItineraryPage } from './pages/PublicItineraryPage';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Dashboard Routes (Authenticated) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/explore" element={<Navigate to="/activities/search" replace />} />
              <Route path="/create-trip" element={<CreateTripPage />} />
              
              <Route path="/activities/search" element={<ActivitySearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              
              {/* Trip Sub-routes */}
              <Route path="/trips/:id/builder" element={<ItineraryBuilderPage />} />
              <Route path="/trips/:id" element={<ItineraryViewPage />} />
              <Route path="/trips/:id/budget" element={<BudgetPage />} />
              <Route path="/trips/:id/calendar" element={<TripCalendarPage />} />
            </Route>
          </Route>
          
          {/* Public Routes */}
          <Route path="/public/:shareId" element={<PublicItineraryPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
