import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if accessing admin routes (excluding login page)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin token cookie
    const adminToken = request.cookies.get('adminToken');

    // If no token, redirect to login
    if (!adminToken) {
      console.warn(`⚠️ Unauthorized access attempt to ${request.nextUrl.pathname}`);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    '/admin/:path*'
  ]
};
