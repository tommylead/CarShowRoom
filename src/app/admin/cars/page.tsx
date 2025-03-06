import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Car } from "@prisma/client";

export default async function AdminCarsPage() {
  // Xác thực Admin
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Lấy danh sách xe
  const cars = await prisma.car.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý xe</h1>
        <Link 
          href="/admin/cars/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Thêm xe mới
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b text-left">Tên xe</th>
              <th className="py-3 px-4 border-b text-left">Thương hiệu</th>
              <th className="py-3 px-4 border-b text-left">Mẫu</th>
              <th className="py-3 px-4 border-b text-left">Năm</th>
              <th className="py-3 px-4 border-b text-left">Giá</th>
              <th className="py-3 px-4 border-b text-left">Loại</th>
              <th className="py-3 px-4 border-b text-left">Số lượng</th>
              <th className="py-3 px-4 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td className="py-3 px-4 border-b">{car.name}</td>
                <td className="py-3 px-4 border-b">{car.brand}</td>
                <td className="py-3 px-4 border-b">{car.model}</td>
                <td className="py-3 px-4 border-b">{car.year}</td>
                <td className="py-3 px-4 border-b">{car.price.toLocaleString('vi-VN')} đ</td>
                <td className="py-3 px-4 border-b">{car.type}</td>
                <td className="py-3 px-4 border-b">{car.stock}</td>
                <td className="py-3 px-4 border-b text-center">
                  <div className="flex justify-center space-x-2">
                    <Link 
                      href={`/admin/cars/edit/${car.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Sửa
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link 
                      href={`/admin/cars/delete/${car.id}`}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 