/**
 * POST /api/kitchen/logout
 * Clears the kitchen authentication cookie
 */

export async function POST(request) {
  try {
    const response = new Response(
      JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

    // Clear kitchen token cookie
    response.headers.set(
      'Set-Cookie',
      `kitchenToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );

    return response;
  } catch (error) {
    console.error('Kitchen logout error:', error);
    return Response.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    );
  }
}
