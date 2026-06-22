import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import {
  getCustomerByPhone,
  getCustomerSummary,
  getUpgradeRecommendation,
  resetMonthlyMetrics,
} from '@/utils/planComparison';
import { NextResponse } from 'next/server';

/**
 * GET /api/customers/[phone]
 * Get customer details by phone number
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { phone } = params;
    const customer = await getCustomerByPhone(phone);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    const summary = await getCustomerSummary(phone);

    return NextResponse.json({
      success: true,
      customer,
      summary,
    });
  } catch (error) {
    console.error('❌ Error fetching customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/customers/[phone]
 * Update customer profile and plan
 */
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { phone } = params;
    const body = await request.json();

    const customer = await getCustomerByPhone(phone);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = [
      'name',
      'email',
      'address',
      'planType',
      'preferences',
      'notes',
      'status',
    ];

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        customer[field] = body[field];
      }
    });

    const updated = await customer.save();
    const summary = await getCustomerSummary(phone);

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updated,
      summary,
    });
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[phone]
 * Deactivate customer account
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { phone } = params;
    const customer = await getCustomerByPhone(phone);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    customer.status = 'INACTIVE';
    customer.planStatus = 'CANCELLED';
    await customer.save();

    return NextResponse.json({
      success: true,
      message: 'Customer deactivated successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
