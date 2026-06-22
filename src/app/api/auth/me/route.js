/**
 * GET /api/auth/me
 * Get current authenticated user info
 */

import { extractUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const userFromAuth = extractUserFromRequest(request);
    
    // Return success with null user if not authenticated
    // This prevents errors for non-customer routes (like kitchen)
    if (!userFromAuth) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    await dbConnect();

    // Get full customer info
    const customer = await Customer.findOne({ phone: userFromAuth.phone });

    if (!customer) {
      return NextResponse.json({
        success: true,
        user: null,
      });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          phone: customer.phone,
          name: customer.name,
          planType: customer.planType,
          planStatus: customer.planStatus,
          customerId: customer._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
