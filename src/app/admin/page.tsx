'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminDashboard() {
  const { user, loading, isAdmin, refreshToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAdminPage = async () => {
      try {
        // Làm mới token để cập nhật quyền mới nhất
        if (user) {
          console.log('[AdminPage] Refreshing token...');
          await refreshToken();
        }
        
        // Chờ auth context được khởi tạo
        if (!loading) {
          if (!user) {
            // Nếu chưa đăng nhập, chuyển về trang đăng nhập
            console.log('[AdminPage] No user found, redirecting to login');
            router.push('/auth/login');
          } else if (!isAdmin) {
            // Nếu không phải admin, chuyển về trang chủ
            console.log('[AdminPage] Not admin, redirecting to home');
            router.push('/');
          } else {
            // Nếu là admin, cho phép truy cập trang
            console.log('[AdminPage] Admin verified, showing dashboard');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('[AdminPage] Error initializing admin page:', error);
        router.push('/');
      }
    };
    
    initializeAdminPage();
  }, [user, loading, isAdmin, router, refreshToken]);

  // Hiển thị loading khi đang xác thực
  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bảng điều khiển Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Quản lý xe" 
          description="Thêm, sửa, xóa thông tin xe" 
          link="/admin/cars"
          icon="🚗"
        />
        <DashboardCard 
          title="Quản lý người dùng" 
          description="Quản lý tài khoản người dùng" 
          link="/admin/users"
          icon="👥"
        />
        <DashboardCard 
          title="Quản lý đơn hàng" 
          description="Xem và xử lý các đơn đặt hàng" 
          link="/admin/orders"
          icon="📦"
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, description, link, icon }: { 
  title: string; 
  description: string; 
  link: string;
  icon: string;
}) {
  return (
    <Link href={link}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  );
} 