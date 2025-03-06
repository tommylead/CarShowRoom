export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Trang Kiểm Tra</h1>
      <p className="text-xl mb-8">Nếu bạn thấy trang này, máy chủ đang hoạt động bình thường.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Thông tin cơ bản</h2>
          <p>Trang web này đang chạy trên Next.js 13.4.12</p>
          <p>Sử dụng Tailwind CSS để tạo giao diện</p>
          <p>Dữ liệu được lưu trong SQLite thông qua Prisma</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Kiểm tra tính năng</h2>
          <p>Trang này không sử dụng bất kỳ API nào</p>
          <p>Không cần đến Firebase hay Cloudinary</p>
          <p>Không yêu cầu xác thực người dùng</p>
        </div>
      </div>
    </div>
  );
} 