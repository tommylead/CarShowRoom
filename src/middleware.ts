import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Các route cần xác thực
const authRoutes = ['/profile', '/cart', '/checkout', '/orders'];
// Các route chỉ dành cho admin
const adminRoutes = ['/admin'];
// Các route dành cho khách (chưa đăng nhập)
const guestRoutes = ['/login', '/register', '/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  
  console.log(`[Middleware] Path: ${path}, Token exists: ${!!token}`);

  // Kiểm tra token
  if (!token) {
    // Nếu chưa đăng nhập và cố truy cập route cần xác thực
    if (authRoutes.some(route => path.startsWith(route)) || 
        adminRoutes.some(route => path.startsWith(route))) {
      console.log(`[Middleware] Redirecting to login: no token for protected route ${path}`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } else {
    // Nếu đã đăng nhập mà cố truy cập route dành cho khách
    if (guestRoutes.some(route => path.startsWith(route))) {
      console.log(`[Middleware] Redirecting to home: already authenticated user accessing guest route ${path}`);
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Kiểm tra quyền admin nếu truy cập route admin
    if (adminRoutes.some(route => path.startsWith(route))) {
      try {
        console.log(`[Middleware] Verifying admin access for path: ${path}`);
        // Kiểm tra token và xác thực quyền admin
        const response = await fetch(`${request.nextUrl.origin}/api/auth/verify-admin`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log(`[Middleware] Admin verification response: ${response.status}`);
        
        if (!response.ok) {
          const responseData = await response.json();
          console.log(`[Middleware] Admin verification failed:`, responseData);
          
          // Nếu là lỗi forbidden, chuyển về trang chính
          if (response.status === 403) {
            console.log(`[Middleware] Redirecting to home: forbidden access`);
            return NextResponse.redirect(new URL('/', request.url));
          }
          // Nếu là lỗi unauthorized, chuyển về trang đăng nhập
          console.log(`[Middleware] Redirecting to login: unauthorized access`);
          return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        
        console.log(`[Middleware] Admin verification successful`);
      } catch (error) {
        console.error('[Middleware] Auth verification error:', error);
        return NextResponse.redirect(new URL('/auth/login', request.url));
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
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 