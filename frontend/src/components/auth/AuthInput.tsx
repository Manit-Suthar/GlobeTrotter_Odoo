import React, { type InputHTMLAttributes } from 'react';

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <label className="text-sm font-medium text-gray-700 mb-1.5" htmlFor={props.id || props.name}>
        {label}
      </label>
      <input
        className={`w-full px-4 py-2.5 rounded-md border ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-600 focus:border-teal-600'
        } bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50`}
        {...props}
      />
      {error && (
        <span className="text-red-500 text-xs mt-1 font-medium">{error}</span>
      )}
    </div>
  );
};
