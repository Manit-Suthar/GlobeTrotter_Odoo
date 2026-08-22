import React, { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface ProfileImageUploadProps {
  onImageSelected: (file: File | null) => void;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ onImageSelected }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelected(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3">Profile Photo (Optional)</p>
      
      <div className="flex items-center space-x-6">
        <div 
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-200 ${previewUrl ? 'border-teal-600 shadow-md' : 'border-dashed border-gray-300 bg-white group-hover:border-teal-500 group-hover:bg-teal-50'}`}>
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-gray-400 group-hover:text-teal-500 transition-colors" />
            )}
          </div>
          
          {previewUrl && (
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-medium">Change</span>
            </div>
          )}

          {previewUrl && (
            <button 
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-500 rounded-full p-1.5 shadow-sm hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors z-10"
              aria-label="Remove photo"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          <p>We recommend a square image,</p>
          <p>at least 200x200 pixels.</p>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        aria-label="Upload profile photo"
      />
    </div>
  );
};
