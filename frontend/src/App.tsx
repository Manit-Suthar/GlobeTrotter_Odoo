import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-blue-600">GlobeTrotter</Link>
            <div className="space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Sign Up</Link>
            </div>
          </nav>
        </header>
        
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<div className="text-center mt-12"><h1 className="text-4xl font-bold mb-4">Welcome to GlobeTrotter</h1><p className="text-xl text-gray-600">Plan your multi-city trips with ease.</p></div>} />
            <Route path="/login" element={<div>Login Page Placeholder</div>} />
            <Route path="/signup" element={<div>Signup Page Placeholder</div>} />
            <Route path="/dashboard" element={<div>Dashboard Placeholder</div>} />
            <Route path="/trips/new" element={<div>Create Trip Placeholder</div>} />
            <Route path="/trips/:id" element={<div>Itinerary View Placeholder</div>} />
            <Route path="/trips/:id/builder" element={<div>Itinerary Builder Placeholder</div>} />
            <Route path="/trips/:id/budget" element={<div>Budget View Placeholder</div>} />
            <Route path="/public/:token" element={<div>Public Itinerary Placeholder</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
