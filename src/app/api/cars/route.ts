import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import admin from 'firebase-admin';

// Danh sách các loại xe hợp lệ
const validCarTypes = ["SUV", "SEDAN", "COUPE", "TRUCK", "VAN"];

// Khởi tạo Firebase Admin nếu chưa được khởi tạo
const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    // Đảm bảo private key được xử lý đúng
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
      : undefined;
      
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
  return admin;
};

// GET /api/cars - Get all cars with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const available = searchParams.get('available');
    const limit = searchParams.get('limit');

    // Xây dựng filter query
    const filter: Prisma.CarWhereInput = {};

    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price = { gte: parseFloat(minPrice) };
      if (maxPrice) filter.price = { ...filter.price as any, lte: parseFloat(maxPrice) };
    }
    if (available === 'true') filter.isAvailable = true;

    const cars = await prisma.car.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error getting cars:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy danh sách xe' },
      { status: 500 }
    );
  }
}

// POST /api/cars - Create new car
export async function POST(request: NextRequest) {
  try {
    // Xác thực admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const firebaseAdmin = getFirebaseAdmin();
    
    try {
      // Xác thực token Firebase
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      const { uid } = decodedToken;

      // Kiểm tra quyền admin
      const user = await prisma.user.findFirst({
        where: { 
          firebaseUid: uid 
        },
      });

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Không có quyền truy cập' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate dữ liệu
    const { name, brand, model, year, price, color, category, description, features, images, stock, isAvailable } = data;

    if (!name || !brand || !model || !year || !price || !color || !category || !description || !features || !images) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ thông tin xe' },
        { status: 400 }
      );
    }

    // Tạo xe mới
    const newCar = await prisma.car.create({
      data: {
        name,
        brand,
        model,
        year,
        price,
        color,
        category,
        description,
        features,
        images,
        stock: stock || 1,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    return NextResponse.json(newCar, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tạo xe mới',
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// PUT /api/cars - Update multiple cars
export async function PUT(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const cars = await request.json();

    const updatedCars = await Promise.all(
      cars.map(async (car: any) => {
        const { id, ...updateData } = car;
        
        // Chuyển đổi giá trị từ chuỗi sang số (nếu cần)
        const carData = {
          ...updateData,
          price: typeof updateData.price === 'string' ? parseFloat(updateData.price) : updateData.price,
          year: typeof updateData.year === 'string' ? parseInt(updateData.year) : updateData.year,
          stock: typeof updateData.stock === 'string' ? parseInt(updateData.stock) : updateData.stock,
        };
        
        return prisma.car.update({
          where: { id },
          data: carData,
        });
      })
    );

    return NextResponse.json(updatedCars);
  } catch (error) {
    console.error("[CARS_UPDATE]", error);
    return NextResponse.json(
      { error: "Lỗi khi cập nhật xe", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE /api/cars - Delete multiple cars
export async function DELETE(request: Request) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const { ids } = await request.json();

    await prisma.car.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CARS_DELETE]", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa xe", details: (error as Error).message },
      { status: 500 }
    );
  }
} 