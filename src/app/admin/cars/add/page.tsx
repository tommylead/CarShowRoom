'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import ImageUploader from '@/components/admin/ImageUploader';

type FormValues = {
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  color: string;
  category: string;
  description: string;
  features: string;
  stock: number;
};

const categories = [
  'SUV',
  'Sedan',
  'Coupe',
  'Hatchback',
  'Convertible',
  'Pickup',
  'Minivan',
  'Van',
  'Wagon',
  'Other'
];

export default function AddCarPage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (images.length === 0) {
      toast.error('Vui lòng tải lên ít nhất một hình ảnh');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Đang thêm xe...');

    try {
      // Chuyển đổi features từ chuỗi thành mảng
      const featuresArray = data.features
        .split('\n')
        .map((feature) => feature.trim())
        .filter((feature) => feature !== '');

      // Chuẩn bị dữ liệu để gửi lên server
      const carData = {
        ...data,
        price: Number(data.price),
        year: Number(data.year),
        stock: Number(data.stock),
        features: featuresArray,
        images: images,
        isAvailable: true,
      };

      // Gửi request API để tạo xe mới
      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra khi thêm xe');
      }

      toast.success('Thêm xe thành công', { id: toastId });
      router.push('/admin/cars');
    } catch (error) {
      console.error('Lỗi khi thêm xe:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể thêm xe', {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Thêm xe mới</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên xe */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Tên xe <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Vui lòng nhập tên xe' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Hãng xe */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Hãng xe <span className="text-red-500">*</span>
              </label>
              <input
                id="brand"
                type="text"
                {...register('brand', { required: 'Vui lòng nhập hãng xe' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>

            {/* Mẫu xe */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                Mẫu xe <span className="text-red-500">*</span>
              </label>
              <input
                id="model"
                type="text"
                {...register('model', { required: 'Vui lòng nhập mẫu xe' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>

            {/* Năm sản xuất */}
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Năm sản xuất <span className="text-red-500">*</span>
              </label>
              <input
                id="year"
                type="number"
                {...register('year', {
                  required: 'Vui lòng nhập năm sản xuất',
                  min: {
                    value: 1900,
                    message: 'Năm sản xuất phải từ 1900 trở lên',
                  },
                  max: {
                    value: new Date().getFullYear() + 1,
                    message: `Năm sản xuất không thể lớn hơn ${new Date().getFullYear() + 1}`,
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.year && (
                <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
              )}
            </div>

            {/* Giá */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                {...register('price', {
                  required: 'Vui lòng nhập giá xe',
                  min: {
                    value: 0,
                    message: 'Giá xe phải lớn hơn 0',
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Màu sắc */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                Màu sắc <span className="text-red-500">*</span>
              </label>
              <input
                id="color"
                type="text"
                {...register('color', { required: 'Vui lòng nhập màu sắc' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.color && (
                <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
              )}
            </div>

            {/* Danh mục */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                {...register('category', { required: 'Vui lòng chọn danh mục' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Số lượng */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Số lượng <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                type="number"
                {...register('stock', {
                  required: 'Vui lòng nhập số lượng',
                  min: {
                    value: 0,
                    message: 'Số lượng không thể nhỏ hơn 0',
                  },
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', { required: 'Vui lòng nhập mô tả' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Tính năng */}
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-700">
              Tính năng (mỗi dòng một tính năng) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="features"
              rows={4}
              {...register('features', { required: 'Vui lòng nhập các tính năng' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ví dụ:&#10;Hệ thống phanh ABS&#10;Camera lùi&#10;Cảm biến áp suất lốp"
            />
            {errors.features && (
              <p className="mt-1 text-sm text-red-600">{errors.features.message}</p>
            )}
          </div>

          {/* Hình ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh xe <span className="text-red-500">*</span>
            </label>
            <ImageUploader images={images} onImagesChange={setImages} />
          </div>

          {/* Nút submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Thêm xe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 