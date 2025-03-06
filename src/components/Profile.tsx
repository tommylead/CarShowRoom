'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FaUser, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Định nghĩa các tab
type TabType = 'info' | 'orders';

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Đã đăng xuất thành công');
      router.push('/');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Thông tin tài khoản
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Quản lý thông tin cá nhân và đơn hàng của bạn
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <FaSignOutAlt className="mr-2" />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'info'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaUser className="inline-block mr-2" />
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'orders'
                ? 'border-b-2 border-indigo-500 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaHistory className="inline-block mr-2" />
            Lịch sử đơn hàng
          </button>
        </nav>

        {/* Content */}
        <div className="px-4 py-5 sm:p-6">
          {activeTab === 'info' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Thông tin cơ bản
                </h4>
                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user?.displayName || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Đơn hàng của bạn
              </h4>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {/* Render orders here */}
                  <p>Danh sách đơn hàng sẽ được hiển thị ở đây</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Chưa có đơn hàng
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => router.push('/cars')}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Xem xe ngay
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 