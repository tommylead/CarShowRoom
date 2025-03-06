import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminDashboard() {
  // Xác thực Admin
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
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