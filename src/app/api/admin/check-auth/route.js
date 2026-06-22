import { NextResponse } from 'next/server';

export async function GET(request) {
  const adminToken = request.cookies.get('adminToken');

  if (adminToken && adminToken.value === 'authenticated') {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
