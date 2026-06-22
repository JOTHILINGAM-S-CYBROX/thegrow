import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the admin token cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout successful' 
    });
    
    response.cookies.set('adminToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0  // Expire immediately
    });

    console.log('✅ Admin logout successful');
    return response;
  } catch (error) {
    console.error('❌ Logout API error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
