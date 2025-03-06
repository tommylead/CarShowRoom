'use client';

import Link from 'next/link';

export default function CallToAction() {
  return (
    <div className="bg-indigo-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <div className="animate-fade-in-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            <span className="block">Sẵn sàng để sở hữu xe mơ ước?</span>
            <span className="block text-indigo-600">Liên hệ với chúng tôi ngay hôm nay.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            Đội ngũ tư vấn chuyên nghiệp của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
            Nhận tư vấn miễn phí và ưu đãi đặc biệt khi liên hệ ngay!
          </p>
        </div>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 animate-fade-in-right">
          <div className="inline-flex rounded-md shadow">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Liên hệ ngay
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
            >
              Xem các xe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 