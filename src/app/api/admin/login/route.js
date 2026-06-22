import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate that password is set
    if (!adminPassword) {
      console.error('⚠️ ADMIN_PASSWORD not configured in environment variables');
      return NextResponse.json(
        { error: 'Admin authentication not configured' },
        { status: 500 }
      );
    }

    // Verify password
    if (password === adminPassword) {
      // Create response with secure cookie
      const response = NextResponse.json({ success: true, message: 'Login successful' });
      
      // Set secure HTTP-only cookie
      response.cookies.set('adminToken', 'authenticated', {
        httpOnly: true,  // Cannot be accessed by JavaScript
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        sameSite: 'lax',  // CSRF protection
        maxAge: 7 * 24 * 60 * 60  // 7 days
      });

      console.log('✅ Admin login successful');
      return response;
    }

    // Invalid password
    console.warn('⚠️ Admin login failed - Invalid password');
    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('❌ Login API error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
