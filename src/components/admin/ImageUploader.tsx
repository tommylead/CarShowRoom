'use client';

import { useState, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { FaUpload, FaTrash } from 'react-icons/fa';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  images, 
  onImagesChange,
  maxImages = 10 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Kiểm tra số lượng ảnh
    if (images.length + files.length > maxImages) {
      setError(`Bạn chỉ có thể tải lên tối đa ${maxImages} ảnh.`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const newImages: string[] = [];
      
      // Đọc files dưới dạng base64
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        
        // Kiểm tra loại file
        if (!file.type.startsWith('image/')) {
          setError('Vui lòng chỉ tải lên các file hình ảnh.');
          setIsUploading(false);
          return;
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Kích thước hình ảnh không được vượt quá 5MB.');
          setIsUploading(false);
          return;
        }

        // Convert file to base64
        const base64 = await readFileAsBase64(file);
        newImages.push(base64);
      }

      // Gửi ảnh lên server
      const response = await fetch('/api/admin/upload-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: newImages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi tải ảnh lên.');
      }

      const data = await response.json();
      
      // Cập nhật danh sách ảnh
      onImagesChange([...images, ...data.urls]);
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setIsUploading(false);
      // Reset input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Không thể đọc file'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi đọc file'));
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 mt-2">
        {images.map((image, index) => (
          <div key={index} className="relative w-32 h-32 group">
            <Image
              src={image}
              alt={`Hình ảnh xe ${index + 1}`}
              width={128}
              height={128}
              className="object-cover rounded-md border border-gray-300"
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Xóa ảnh"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <div 
            className="w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <FaUpload className="mx-auto text-gray-400" size={24} />
              <span className="block mt-1 text-sm text-gray-500">Tải ảnh lên</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}
      </div>

      {isUploading && (
        <div className="text-sm text-indigo-600">Đang tải ảnh lên...</div>
      )}
      
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      
      <div className="text-xs text-gray-500">
        * Tải lên tối đa {maxImages} ảnh, mỗi ảnh không quá 5MB
      </div>
    </div>
  );
};

export default ImageUploader; 