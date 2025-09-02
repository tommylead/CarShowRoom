'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaSave, FaTags, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Link from 'next/link';
import CarForm from '@/components/admin/CarForm';

export default function EditCarPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCar() {
      try {
        const response = await fetch(`/api/cars/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to load car data');
        }
        const data = await response.json();
        setCar(data);
      } catch (error) {
        console.error('Error loading car:', error);
        setError('Failed to load car data');
        toast.error('Không thể tải dữ liệu xe');
      } finally {
        setLoading(false);
      }
    }

    loadCar();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin h-8 w-8 text-primary-600" />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error || 'Không tìm thấy xe'}</p>
        <Link
          href="/admin/cars"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Quay lại danh sách xe
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Chỉnh sửa xe</h1>
        <div className="flex space-x-3">
          <Link
            href={`/admin/cars/${params.id}/seo`}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <FaTags className="mr-2" />
            Quản lý SEO
          </Link>
          <Link
            href={`/cars/${params.id}`}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            target="_blank"
          >
            <FaSearch className="mr-2" />
            Xem trang sản phẩm
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <CarForm car={car} />
      </div>
    </div>
  );
} 