'use client';

import { useState } from 'react';
import { useUploadImage } from '@/hooks/useUploadImage';

export const ImageUploader = () => {
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const { uploadImages, isLoading, error } = useUploadImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      const files = Array.from(e.target.files);
      const urls = await uploadImages(files);
      setUploadedUrls(prev => [...prev, ...urls]);
    } catch (err) {
      console.error('Error uploading files:', err);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {isLoading && <p className="text-blue-600">Đang tải ảnh lên...</p>}
      {error && <p className="text-red-600">Lỗi: {error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {uploadedUrls.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Uploaded ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
}; 