'use client';

import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="text-2xl font-bold text-white">
              CarShowroom
            </Link>
            <p className="text-gray-400 text-base">
              Showroom xe hơi hàng đầu Việt Nam với các dòng xe cao cấp từ các thương hiệu nổi tiếng thế giới.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">YouTube</span>
                <FaYoutube className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-3">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Sản phẩm</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/cars" className="text-base text-gray-400 hover:text-white">
                      Xe mới
                    </Link>
                  </li>
                  <li>
                    <Link href="/cars?type=used" className="text-base text-gray-400 hover:text-white">
                      Xe đã qua sử dụng
                    </Link>
                  </li>
                  <li>
                    <Link href="/cars?type=luxury" className="text-base text-gray-400 hover:text-white">
                      Xe sang
                    </Link>
                  </li>
                  <li>
                    <Link href="/cars?type=suv" className="text-base text-gray-400 hover:text-white">
                      SUV
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Hỗ trợ</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/faq" className="text-base text-gray-400 hover:text-white">
                      Câu hỏi thường gặp
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="text-base text-gray-400 hover:text-white">
                      Hỗ trợ kỹ thuật
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-400 hover:text-white">
                      Liên hệ
                    </Link>
                  </li>
                  <li>
                    <Link href="/warranty" className="text-base text-gray-400 hover:text-white">
                      Bảo hành
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Liên hệ với chúng tôi</h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-center">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">+84 28 1234 5678</span>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-400">info@carshowroom.com</span>
                </li>
              </ul>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mt-8">Giờ làm việc</h3>
              <p className="mt-4 text-base text-gray-400">
                Thứ 2 - Thứ 6: 8:00 - 19:00<br />
                Thứ 7 - Chủ nhật: 9:00 - 18:00
              </p>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {currentYear} CarShowroom. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
} 