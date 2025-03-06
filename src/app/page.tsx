'use client';

import Hero from './_components/Hero';
import Features from './_components/Features';
import CallToAction from './_components/CallToAction';
import Link from 'next/link';
import { FaSearch, FaCar, FaShieldAlt } from 'react-icons/fa';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <Features />
      
      {/* Popular Cars Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Bộ sưu tập</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Xe nổi bật
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Khám phá những mẫu xe được yêu thích nhất tại showroom của chúng tôi
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Car Card 1 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Mercedes-Benz S-Class" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Mercedes-Benz S-Class</h3>
                <p className="mt-1 text-gray-500">Sedan hạng sang đầu bảng với công nghệ tiên tiến</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-indigo-600 font-bold">2.500.000.000 ₫</span>
                  <Link href="/cars/1" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Car Card 2 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="BMW 7 Series" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">BMW 7 Series</h3>
                <p className="mt-1 text-gray-500">Sự kết hợp hoàn hảo giữa sang trọng và thể thao</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-indigo-600 font-bold">2.300.000.000 ₫</span>
                  <Link href="/cars/2" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Car Card 3 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <img 
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Audi A8" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Audi A8</h3>
                <p className="mt-1 text-gray-500">Định nghĩa mới về sự sang trọng và công nghệ</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-indigo-600 font-bold">2.400.000.000 ₫</span>
                  <Link href="/cars/3" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Link 
              href="/cars" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Xem tất cả xe
            </Link>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Dịch vụ</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Chúng tôi cung cấp
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Không chỉ bán xe, chúng tôi còn mang đến trải nghiệm dịch vụ toàn diện
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* Service 1 */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                <FaSearch className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Tư vấn chọn xe</h3>
              <p className="mt-2 text-base text-gray-500">
                Đội ngũ tư vấn giàu kinh nghiệm sẽ giúp bạn tìm được chiếc xe phù hợp nhất với nhu cầu và ngân sách.
              </p>
            </div>
            
            {/* Service 2 */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                <FaCar className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Lái thử xe</h3>
              <p className="mt-2 text-base text-gray-500">
                Trải nghiệm lái thử trước khi quyết định với đầy đủ các dòng xe mới nhất từ các hãng hàng đầu.
              </p>
            </div>
            
            {/* Service 3 */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100">
                <FaShieldAlt className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Bảo hành & Bảo dưỡng</h3>
              <p className="mt-2 text-base text-gray-500">
                Dịch vụ bảo hành và bảo dưỡng chuyên nghiệp giúp xe của bạn luôn trong tình trạng tốt nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <CallToAction />
    </main>
  );
}
