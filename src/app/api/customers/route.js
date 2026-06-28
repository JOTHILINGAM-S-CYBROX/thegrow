import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import {
  getCustomerByPhone,
  getCustomerSummary,
  createOrUpdateCustomerPlan,
  getUpgradeRecommendation,
  resetMonthlyMetrics,
  updateCustomerUsage,
} from '@/utils/planComparison';
import { NextResponse } from 'next/server';

/**
 * GET /api/customers
 * Fetch all customers with optional filtering
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('planType');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (planType) filter.planType = planType;
    if (status) filter.status = status;

    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    return NextResponse.json({
      success: true,
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * Create or update a customer with a plan
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    if (!body.phone || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Phone and name are required' },
        { status: 400 }
      );
    }

    const customer = await createOrUpdateCustomerPlan({
      phone: body.phone,
      name: body.name,

      address: body.address,
      planType: body.planType || 'FREE',
    });

    const summary = await getCustomerSummary(customer.phone);

    return NextResponse.json(
      {
        success: true,
        message: 'Customer created/updated successfully',
        customer,
        summary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
