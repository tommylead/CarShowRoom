import { NextRequest, NextResponse } from 'next/server';
import { uploadMultipleImages } from '@/lib/cloudinary';
import { auth as firebaseAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Xác thực token admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // Xác thực token Firebase
      const decodedToken = await firebaseAuth.verifyIdToken(token);
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

    // Nhận dữ liệu hình ảnh
    const body = await request.json();
    const { images } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Không có hình ảnh được gửi lên' },
        { status: 400 }
      );
    }

    // Kiểm tra số lượng ảnh (tối đa 10 ảnh)
    if (images.length > 10) {
      return NextResponse.json(
        { error: 'Chỉ được tải lên tối đa 10 ảnh' },
        { status: 400 }
      );
    }

    // Tải lên Cloudinary
    const urls = await uploadMultipleImages(images, 'car-showroom');

    return NextResponse.json({ 
      success: true, 
      urls
    });
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên:', error);
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tải ảnh lên',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 