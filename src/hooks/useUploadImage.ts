import { useState } from 'react';

interface UploadImageResponse {
  urls: string[];
}

export const useUploadImage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data: UploadImageResponse = await response.json();
      return data.urls;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadImages,
    isLoading,
    error,
  };
}; 