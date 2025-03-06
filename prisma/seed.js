const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Xóa dữ liệu cũ
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();

  // Tạo người dùng
  const user = await prisma.user.create({
    data: {
      name: 'Người dùng mẫu',
      email: 'user@example.com',
      password: '$2a$10$vQ8yTYxV4WZz.tJh9r6jYOH/x3fS5uCRODWCz7Y3WQTJQdCZvT9HS', // 'password123'
      role: 'USER',
    },
  });

  // Tạo admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      password: '$2a$10$vQ8yTYxV4WZz.tJh9r6jYOH/x3fS5uCRODWCz7Y3WQTJQdCZvT9HS', // 'password123'
      role: 'ADMIN',
    },
  });

  // Tạo dữ liệu xe mẫu
  const cars = [
    {
      name: 'Toyota Camry',
      brand: 'Toyota',
      model: 'Camry',
      year: 2023,
      price: 30000,
      color: 'Đen',
      type: 'SEDAN',
      images: 'https://imageio.forbes.com/specials-images/imageserve/5d35eacaf1176b0008974b54/2020-Toyota-Camry-TRD/0x0.jpg?format=jpg&crop=4560,2565,x790,y784,safe&width=960',
      description: 'Toyota Camry là một chiếc sedan hạng trung sang trọng và đáng tin cậy',
      stock: 10,
    },
    {
      name: 'Honda CR-V',
      brand: 'Honda',
      model: 'CR-V',
      year: 2022,
      price: 35000,
      color: 'Trắng',
      type: 'SUV',
      images: 'https://hips.hearstapps.com/hmg-prod/images/2023-honda-cr-v-hybrid-awd-touring-414-1673297917.jpg?crop=0.676xw:0.570xh;0.0929xw,0.362xh&resize=1200:*',
      description: 'Honda CR-V là một SUV nhỏ gọn với không gian rộng rãi và tiết kiệm nhiên liệu',
      stock: 8,
    },
    {
      name: 'BMW X5',
      brand: 'BMW',
      model: 'X5',
      year: 2023,
      price: 75000,
      color: 'Xanh',
      type: 'SUV',
      images: 'https://www.bmw.vn/content/dam/bmw/common/all-models/x-series/x5/2021/navigation/bmw-x-series-x5-phev-modelfinder.png',
      description: 'BMW X5 là một SUV hạng sang với hiệu suất tuyệt vời và công nghệ hiện đại',
      stock: 5,
    },
    {
      name: 'Mercedes C300',
      brand: 'Mercedes',
      model: 'C300',
      year: 2022,
      price: 55000,
      color: 'Bạc',
      type: 'SEDAN',
      images: 'https://www.motortrend.com/uploads/2022/07/2022-Mercedes-Benz-C-300-4Matic-front-three-quarter-view-2.jpg',
      description: 'Mercedes C300 là một sedan hạng sang với thiết kế đẹp và công nghệ tiên tiến',
      stock: 6,
    },
    {
      name: 'Ford F-150',
      brand: 'Ford',
      model: 'F-150',
      year: 2023,
      price: 45000,
      color: 'Đỏ',
      type: 'TRUCK',
      images: 'https://www.motortrend.com/uploads/2023/07/2023-ford-f-150-raptor-front-three-quarter-view-2.jpg',
      description: 'Ford F-150 là một chiếc xe bán tải mạnh mẽ và đa năng cho công việc và giải trí',
      stock: 7,
    },
  ];

  for (const car of cars) {
    await prisma.car.create({
      data: car,
    });
  }

  console.log('Dữ liệu mẫu đã được tạo thành công');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 