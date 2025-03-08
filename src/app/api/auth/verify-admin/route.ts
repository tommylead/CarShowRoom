import { NextRequest, NextResponse } from 'next/server';
import { auth as firebaseAuth } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Lấy token từ header Authorization
    const authHeader = request.headers.get('Authorization');
    console.log('[verify-admin] Received auth header:', authHeader ? 'exists' : 'missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[verify-admin] Invalid auth header format');
      return NextResponse.json(
        { error: 'Không có quyền truy cập' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      // Xác thực token Firebase
      console.log('[verify-admin] Verifying Firebase token');
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      const { uid } = decodedToken;
      console.log('[verify-admin] Firebase token verified for UID:', uid);
      
      // Log các claims có trong token
      console.log('[verify-admin] Token claims:', decodedToken);

      // Kiểm tra nếu có claim role là ADMIN
      if (decodedToken.role === 'ADMIN') {
        console.log('[verify-admin] Role ADMIN found in Firebase claims');
        return NextResponse.json({ 
          message: 'Xác thực thành công thông qua Firebase claims',
          user: {
            uid: uid,
            email: decodedToken.email,
            role: 'ADMIN'
          }
        });
      }

      // Kiểm tra quyền người dùng trong database
      console.log('[verify-admin] Checking user in database');
      const user = await prisma.user.findFirst({
        where: { 
          firebaseUid: uid 
        },
      });

      console.log('[verify-admin] Database user result:', user);

      if (!user) {
        console.log('[verify-admin] User not found in database');
        return NextResponse.json(
          { error: 'Người dùng không tồn tại' },
          { status: 404 }
        );
      }

      // Kiểm tra nếu người dùng có vai trò ADMIN
      if (user.role !== 'ADMIN') {
        console.log('[verify-admin] User role is not ADMIN:', user.role);
        return NextResponse.json(
          { error: 'Không có quyền truy cập' },
          { status: 403 }
        );
      }

      console.log('[verify-admin] Admin verification successful');
      return NextResponse.json({ 
        message: 'Xác thực thành công',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('[verify-admin] Token verification error:', error);
      return NextResponse.json(
        { error: 'Lỗi xác thực' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[verify-admin] General error:', error);
    return NextResponse.json(
      { error: 'Lỗi xác thực' },
      { status: 401 }
    );
  }
} 