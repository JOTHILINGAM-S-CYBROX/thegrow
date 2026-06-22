/**
 * POST /api/kitchen/login
 * Kitchen staff login with password
 * Sets a kitchenToken cookie for authentication
 */

export async function POST(request) {
  try {
    const { password } = await request.json();

    // Verify password
    const KITCHEN_PASSWORD = process.env.KITCHEN_PASSWORD || 'kitchen123';

    if (!password || password !== KITCHEN_PASSWORD) {
      return Response.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create response with token cookie
    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Kitchen staff logged in successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    // Set kitchen token cookie
    response.headers.set(
      'Set-Cookie',
      `kitchenToken=authenticated; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
    );

    return response;
  } catch (error) {
    console.error('Kitchen login error:', error);
    return Response.json(
      { success: false, message: 'Failed to login' },
      { status: 500 }
    );
  }
}
