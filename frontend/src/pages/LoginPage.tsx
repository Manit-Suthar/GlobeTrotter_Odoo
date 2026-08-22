import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthInput } from '../components/auth/AuthInput';
import { PasswordInput } from '../components/auth/PasswordInput';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = location.state?.from?.pathname || '/dashboard';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      console.log('Logging in user, remember me:', rememberMe);
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
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
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          disabled={loading}
          autoComplete="email"
          required
        />
        
        <div>
          <PasswordInput
            label="Password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
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
