import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Các route cần xác thực
const authRoutes = ['/profile', '/cart', '/checkout'];
// Các route chỉ dành cho admin
const adminRoutes = ['/admin'];
// Các route dành cho khách (chưa đăng nhập)
const guestRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Kiểm tra token
  if (!token) {
    // Nếu chưa đăng nhập và cố truy cập route cần xác thực
    if (authRoutes.some(route => path.startsWith(route)) || 
        adminRoutes.some(route => path.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else {
    // Nếu đã đăng nhập mà cố truy cập route dành cho khách
    if (guestRoutes.some(route => path.startsWith(route))) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Kiểm tra quyền admin thông qua API route
    if (adminRoutes.some(route => path.startsWith(route))) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 