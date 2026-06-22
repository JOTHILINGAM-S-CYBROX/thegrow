import dbConnect from '@/lib/db';
import { comparePlans } from '@/utils/planComparison';
import { NextResponse } from 'next/server';

/**
 * GET /api/pricing/compare
 * Compare all active pricing plans
 */
export async function GET(request) {
  try {
    await dbConnect();

    const comparison = await comparePlans();

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error) {
    console.error('❌ Error comparing plans:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
