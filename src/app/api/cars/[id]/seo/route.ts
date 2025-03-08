import { NextResponse } from 'next/server';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const seoSchema = z.object({
  metaTitle: z.string().max(70).min(1, 'Tiêu đề là bắt buộc'),
  metaDescription: z.string().max(160).min(1, 'Mô tả là bắt buộc'),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
  structuredData: z.string().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Xác thực quyền admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const auth = getFirebaseAdminAuth();
    if (!auth) {
      return NextResponse.json(
        { error: 'Lỗi kết nối dịch vụ xác thực' },
        { status: 500 }
      );
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      const user = await prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Kiểm tra xe tồn tại
    const car = await prisma.car.findUnique({
      where: { id: params.id },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Không tìm thấy xe' },
        { status: 404 }
      );
    }

    // 3. Validate dữ liệu SEO
    const body = await request.json();
    const validationResult = seoSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // 4. Xác thực JSON structuredData (nếu có)
    try {
      if (body.structuredData) {
        JSON.parse(body.structuredData);
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Dữ liệu có cấu trúc không phải là JSON hợp lệ' },
        { status: 400 }
      );
    }

    // 5. Cập nhật thông tin SEO
    const updatedCar = await prisma.car.update({
      where: { id: params.id },
      data: {
        seo: body
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật SEO thành công',
      data: updatedCar
    });
  } catch (error) {
    console.error('Error updating SEO:', error);
    return NextResponse.json(
      { error: 'Đã xảy ra lỗi khi cập nhật SEO' },
      { status: 500 }
    );
  }
} 