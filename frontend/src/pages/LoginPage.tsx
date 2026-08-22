import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthInput } from '../components/auth/AuthInput';
import { PasswordInput } from '../components/auth/PasswordInput';
import { authService } from '../services/auth.service';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to sign you in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout imageUrl="https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, traveler.</h2>
        <p className="text-gray-600">Your next adventure is waiting.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
          autoComplete="email"
          required
        />
        
        <div>
          <PasswordInput
            label="Password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end mt-2">
            <a href="#" className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 text-white py-2.5 px-4 rounded-md font-medium hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-all duration-200 disabled:opacity-70 flex justify-center items-center mt-2 shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing you in...
            </>
          ) : (
            'Continue Journey'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        New to GlobeTrotter?{' '}
        <Link to="/signup" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};
