import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AuthInput, type AuthInputProps } from './AuthInput';

export const PasswordInput: React.FC<AuthInputProps> = (props) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <AuthInput
        {...props}
        type={showPassword ? 'text' : 'password'}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
