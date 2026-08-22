import React, { useState, useRef } from 'react';
import { Image as ImageIcon, X, Upload } from 'lucide-react';

interface TripCoverUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
}

export const TripCoverUpload: React.FC<TripCoverUploadProps> = ({ value, onChange }) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // In a real app, this would upload to S3 or a backend and return a URL.
  // For the hackathon frontend mock, we'll use a local object URL.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onChange(imageUrl);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {value ? (
        <div 
          className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden group cursor-pointer border border-gray-200"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={value} alt="Trip cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          
          {/* Overlay that appears on hover */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-lg font-medium flex items-center shadow-sm">
              <Upload size={18} className="mr-2 text-teal-600" />
              Change Photo
            </div>
          </div>
          
          <button 
            type="button"
            onClick={clearImage}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-600 p-1.5 rounded-full hover:bg-white hover:text-red-500 shadow-sm transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 sm:h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-teal-300 transition-colors group"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-teal-600 group-hover:scale-110 transition-transform duration-300">
            <ImageIcon size={28} strokeWidth={1.5} />
          </div>
          <div className="text-gray-900 font-semibold mb-1">Add a cover photo</div>
          <div className="text-sm text-gray-500">Make this journey yours.</div>
          
          <div className="mt-6 px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 shadow-sm group-hover:bg-teal-50 group-hover:text-teal-700 group-hover:border-teal-200 transition-colors">
            Choose Image
          </div>
        </div>
      )}
    </div>
  );
};
