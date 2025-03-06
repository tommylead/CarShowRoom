import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = headers();
    const authorization = headersList.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const token = authorization.substring(7); // Lấy phần sau "Bearer "
    const decodedToken = await auth.verifyIdToken(token);

    // Kiểm tra role admin
    if (decodedToken.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Token verification error:', error);
    return new NextResponse('Unauthorized', { status: 401 });
  }
} 