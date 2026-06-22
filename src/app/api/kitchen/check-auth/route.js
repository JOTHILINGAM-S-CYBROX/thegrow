/**
 * GET /api/kitchen/check-auth
 * Check if kitchen staff is authenticated
 * Returns authentication status based on kitchenToken cookie
 */

export async function GET(request) {
  try {
    // Check for kitchenToken cookie (server-side)
    const kitchenToken = request.cookies.get('kitchenToken');

    if (kitchenToken) {
      return Response.json(
        { authenticated: true },
        { status: 200 }
      );
    } else {
      return Response.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Kitchen auth check error:', error);
    return Response.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}
