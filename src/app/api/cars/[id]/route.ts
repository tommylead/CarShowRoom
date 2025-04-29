import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import admin from 'firebase-admin';

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

// Xác thực token admin
const verifyAdminToken = async (request: NextRequest) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false, error: 'Không có quyền truy cập', status: 401 };
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
      return { isAdmin: false, error: 'Không có quyền truy cập', status: 403 };
    }

    return { isAdmin: true, user };
  } catch (error) {
    return { isAdmin: false, error: 'Lỗi xác thực', status: 401 };
  }
};

// GET /api/cars/[id] - Get car by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Không tìm thấy xe' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error getting car:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lấy thông tin xe' },
      { status: 500 }
    );
  }
}

// PUT /api/cars/[id] - Update car
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực admin
    const authResult = await verifyAdminToken(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
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

    // Kiểm tra xe tồn tại
    const existingCar = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Không tìm thấy xe' },
        { status: 404 }
      );
    }

    // Cập nhật xe
    const updatedCar = await prisma.car.update({
      where: { id: params.id },
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
        stock,
        isAvailable,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi cập nhật xe',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cars/[id] - Delete car
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Xác thực admin
    const authResult = await verifyAdminToken(request);
    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Kiểm tra xe tồn tại
    const existingCar = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!existingCar) {
      return NextResponse.json(
        { error: 'Không tìm thấy xe' },
        { status: 404 }
      );
    }

    // Kiểm tra xe có đang được sử dụng trong các đơn hàng hay không
    const orderItems = await prisma.orderItem.findMany({
      where: { carId: params.id },
    });

    if (orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa xe này vì đã có trong đơn hàng' },
        { status: 400 }
      );
    }

    // Xóa xe
    await prisma.car.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Đã xóa xe thành công' });
  } catch (error) {
    console.error('Error deleting car:', error);
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi xóa xe',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 