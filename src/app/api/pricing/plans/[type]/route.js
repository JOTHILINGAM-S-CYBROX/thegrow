import dbConnect from '@/lib/db';
import PricingPlan from '@/models/PricingPlan';
import { NextResponse } from 'next/server';

/**
 * GET /api/pricing/plans/[type]
 * Get a specific pricing plan by type
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { type } = params;

    const plan = await PricingPlan.findOne({
      planType: type,
      isActive: true,
    }).lean();

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Pricing plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error('❌ Error fetching pricing plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pricing/plans/[type]
 * Update a pricing plan (admin only)
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { type } = params;
    const body = await request.json();

    const plan = await PricingPlan.findOneAndUpdate(
      { planType: type },
      body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Pricing plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing plan updated successfully',
      plan,
    });
  } catch (error) {
    console.error('❌ Error updating pricing plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pricing/plans/[type]
 * Deactivate a pricing plan (soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { type } = params;

    const plan = await PricingPlan.findOneAndUpdate(
      { planType: type },
      { isActive: false, discontinuedAt: new Date() },
      { new: true }
    );

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Pricing plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pricing plan deactivated successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting pricing plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
