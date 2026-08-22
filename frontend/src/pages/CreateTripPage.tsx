import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { TripProgress } from '../components/trip/TripProgress';
import { TripCoverUpload } from '../components/trip/TripCoverUpload';
import { AuthInput } from '../components/auth/AuthInput';
import { tripsService } from '../services/trips.service';

export const CreateTripPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
    cover_image: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, cover_image: imageUrl }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Please give your trip a name.';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Please select a start date.';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Please select an end date.';
    }
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be on or after the start date.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newTrip = await tripsService.createTrip(formData);
      // Success! Navigate to itinerary builder
      navigate(`/trips/${newTrip.id}/builder`);
    } catch (err) {
      console.error('Failed to create trip:', err);
      setSubmitError('We couldn\'t create your trip. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Calculate duration
  const tripDuration = useMemo(() => {
    if (formData.start_date && formData.end_date && !errors.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const days = diffDays + 1;
      const nights = diffDays;
      
      if (days === 1) return '1 day';
      return `${days} days · ${nights} nights`;
    }
    return null;
  }, [formData.start_date, formData.end_date, errors.end_date]);

  return (
    <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500 pb-20">
      <TripProgress />

      {/* Hero / Intro */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">Create your journey.</h1>
        <p className="text-lg sm:text-xl text-gray-500 font-medium">Every unforgettable trip starts with a plan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Error Alert */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            <p className="font-medium">{submitError}</p>
          </div>
        )}

        {/* Layout Container */}
        <div className="flex flex-col lg:flex-row lg:space-x-12 space-y-10 lg:space-y-0">
          
          {/* Left Column: Cover Image & Description */}
          <div className="lg:w-[45%] flex flex-col space-y-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Cover photo <span className="text-gray-400 font-normal">(Optional)</span></label>
              <TripCoverUpload value={formData.cover_image} onChange={handleImageChange} />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                Tell us about your trip
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="What are you hoping to experience on this journey? (e.g. Exploring ancient temples, trying local street food...)"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Right Column: Trip Details */}
          <div className="lg:w-[55%] flex flex-col space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                Trip Details
              </h2>
              
              <div className="space-y-6">
                <AuthInput
                  label="Trip name"
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Give your journey a name (e.g. Japan in Autumn)"
                  error={errors.name}
                  required
                />

                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-6 sm:space-y-0">
                  <div className="flex-1">
                    <label htmlFor="start_date" className="block text-sm font-bold text-gray-700 mb-2">
                      Start date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white border ${errors.start_date ? 'border-red-500 ring-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-900`}
                        required
                      />
                    </div>
                    {errors.start_date && (
                      <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.start_date}</p>
                    )}
                  </div>

                  <div className="flex-1">
                    <label htmlFor="end_date" className="block text-sm font-bold text-gray-700 mb-2">
                      End date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        min={formData.start_date}
                        className={`w-full px-4 py-3 bg-white border ${errors.end_date ? 'border-red-500 ring-red-500' : 'border-gray-200'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-gray-900`}
                        required
                      />
                    </div>
                    {errors.end_date && (
                      <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                {tripDuration && (
                  <div className="flex items-center text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2.5 rounded-lg border border-teal-100 animate-in fade-in">
                    <CalendarIcon size={16} className="mr-2" />
                    <span>Duration: {tripDuration}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 mt-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-base font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2" size={20} />
                    Creating your journey...
                  </>
                ) : (
                  <>
                    Create Trip <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </button>
              
              <div className="mt-5 text-center">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft size={16} className="mr-1.5" />
                  Back to Dashboard
                </Link>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};
