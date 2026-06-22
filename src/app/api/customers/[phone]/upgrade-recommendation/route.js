import dbConnect from '@/lib/db';
import {
  getCustomerByPhone,
  getUpgradeRecommendation,
  comparePlans,
  getCustomerSummary,
} from '@/utils/planComparison';
import { NextResponse } from 'next/server';

/**
 * GET /api/customers/[phone]/upgrade-recommendation
 * Get upgrade recommendation for a customer
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { phone } = params;

    const recommendation = await getUpgradeRecommendation(phone);

    return NextResponse.json({
      success: true,
      recommendation,
    });
  } catch (error) {
    console.error('❌ Error getting upgrade recommendation:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
