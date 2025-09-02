'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaSpinner, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface SeoFormData {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  structuredData: string;
}

export default function CarSeoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [car, setCar] = useState<any>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SeoFormData>();

  useEffect(() => {
    async function loadCarData() {
      try {
        const response = await fetch(`/api/cars/${params.id}`);
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu xe');
        }

        const data = await response.json();
        setCar(data);

        // Khởi tạo form với dữ liệu SEO hiện tại
        if (data.seo) {
          Object.entries(data.seo).forEach(([key, value]) => {
            setValue(key as keyof SeoFormData, value as string);
          });
        } else {
          // Thiết lập giá trị mặc định nếu chưa có dữ liệu SEO
          setValue('metaTitle', data.name || '');
          setValue('metaDescription', data.description?.substring(0, 160) || '');
          setValue('keywords', `${data.brand}, ${data.model}, xe hơi, ô tô`);
          setValue('ogTitle', data.name || '');
          setValue('ogDescription', data.description?.substring(0, 160) || '');
          setValue('ogImage', data.images?.[0] || '');
          setValue('canonicalUrl', `https://your-domain.com/cars/${data.id}`);
          setValue('structuredData', JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": data.name,
            "description": data.description,
            "brand": {
              "@type": "Brand",
              "name": data.brand
            },
            "offers": {
              "@type": "Offer",
              "price": data.price,
              "priceCurrency": "VND",
              "availability": data.stock > 0 ? "InStock" : "OutOfStock"
            }
          }, null, 2));
        }
      } catch (error) {
        console.error('Error loading car:', error);
        toast.error('Không thể tải dữ liệu xe');
      } finally {
        setIsLoading(false);
      }
    }

    loadCarData();
  }, [params.id, setValue]);

  const onSubmit = async (data: SeoFormData) => {
    try {
      setIsSaving(true);

      // Validate JSON
      try {
        JSON.parse(data.structuredData);
      } catch (e) {
        toast.error('Dữ liệu cấu trúc JSON không hợp lệ');
        setIsSaving(false);
        return;
      }

      const response = await fetch(`/api/cars/${params.id}/seo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật dữ liệu SEO');
      }

      toast.success('Cập nhật SEO thành công');
      router.push(`/admin/cars/${params.id}`);
    } catch (error) {
      console.error('Error saving SEO data:', error);
      toast.error('Không thể cập nhật dữ liệu SEO');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <FaSpinner className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/admin/cars/${params.id}`} className="text-gray-600 hover:text-primary-600">
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">Quản lý SEO</h1>
        </div>
        <div className="text-sm text-gray-500">
          {car?.name} - {car?.brand} {car?.model}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tiêu đề Meta (Meta Title)
              </label>
              <input
                type="text"
                {...register('metaTitle', { required: 'Tiêu đề là bắt buộc' })}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Tiêu đề SEO (60-70 ký tự)"
                maxLength={70}
              />
              {errors.metaTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.metaTitle.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Từ khóa (Keywords)
              </label>
              <input
                type="text"
                {...register('keywords')}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Từ khóa cách nhau bởi dấu phẩy"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mô tả Meta (Meta Description)
            </label>
            <textarea
              {...register('metaDescription', { 
                required: 'Mô tả là bắt buộc',
                maxLength: { value: 160, message: 'Mô tả tối đa 160 ký tự' }
              })}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Mô tả ngắn gọn về xe (tối đa 160 ký tự)"
              rows={3}
            />
            {errors.metaDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.metaDescription.message}</p>
            )}
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tiêu đề Open Graph
              </label>
              <input
                type="text"
                {...register('ogTitle')}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Tiêu đề khi chia sẻ trên mạng xã hội"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Hình ảnh Open Graph
              </label>
              <input
                type="text"
                {...register('ogImage')}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="URL hình ảnh khi chia sẻ"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mô tả Open Graph
            </label>
            <textarea
              {...register('ogDescription')}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Mô tả khi chia sẻ trên mạng xã hội"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Canonical URL
            </label>
            <input
              type="text"
              {...register('canonicalUrl')}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="URL chính thức của trang sản phẩm"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Dữ liệu có cấu trúc (Structured Data JSON-LD)
            </label>
            <textarea
              {...register('structuredData')}
              className="font-mono w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Mã JSON-LD"
              rows={10}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 