/**
 * POST /api/auth/logout
 * Clears user authentication and session
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

    // Clear the authentication cookie
    response.headers.set(
      'Set-Cookie',
      'userToken=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    );

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    );
  }
}
