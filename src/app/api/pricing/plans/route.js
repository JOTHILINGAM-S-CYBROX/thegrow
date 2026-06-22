import dbConnect from '@/lib/db';
import PricingPlan from '@/models/PricingPlan';
import { comparePlans } from '@/utils/planComparison';
import { NextResponse } from 'next/server';

/**
 * GET /api/pricing/plans
 * Get all active pricing plans
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('planType');

    const filter = { isActive: true };
    if (planType) {
      filter.planType = planType;
    }

    const plans = await PricingPlan.find(filter).sort('order').lean();

    return NextResponse.json({
      success: true,
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('❌ Error fetching pricing plans:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pricing/plans
 * Create a new pricing plan (admin only)
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    if (!body.planType || !body.displayName) {
      return NextResponse.json(
        {
          success: false,
          error: 'planType and displayName are required',
        },
        { status: 400 }
      );
    }

    // Check if plan already exists
    const existing = await PricingPlan.findOne({ planType: body.planType });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Plan already exists' },
        { status: 400 }
      );
    }

    const plan = new PricingPlan(body);
    const saved = await plan.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Pricing plan created successfully',
        plan: saved,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating pricing plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
