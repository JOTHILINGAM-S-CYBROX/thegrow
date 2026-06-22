import dbConnect from '@/lib/db';
import {
  getCustomerByPhone,
  getCustomerSummary,
  resetMonthlyMetrics,
} from '@/utils/planComparison';
import { NextResponse } from 'next/server';

/**
 * GET /api/customers/[phone]/summary
 * Get complete customer summary with plan info
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { phone } = params;

    const summary = await getCustomerSummary(phone);

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('❌ Error getting customer summary:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers/[phone]/summary?action=reset
 * Reset monthly usage metrics
 */
export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { phone } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reset-monthly') {
      const customer = await resetMonthlyMetrics(phone);
      const summary = await getCustomerSummary(phone);

      return NextResponse.json({
        success: true,
        message: 'Monthly metrics reset',
        customer,
        summary,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
