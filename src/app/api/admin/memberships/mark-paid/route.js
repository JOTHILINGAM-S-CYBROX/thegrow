import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Membership from '@/models/Membership';
import Customer from '@/models/Customer';
import { createOrUpdateCustomerPlan } from '@/utils/planComparison';

export async function POST(request) {
  try {
    // 1. Verify admin session cookie
    const adminToken = request.cookies.get('adminToken')?.value;
    if (adminToken !== 'authenticated') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Parse body
    const body = await request.json();
    const { membershipId, paymentDetails = 'Cash received in-person' } = body;

    if (!membershipId) {
      return NextResponse.json(
        { success: false, error: 'Membership ID is required.' },
        { status: 400 }
      );
    }

    // 3. Find the membership
    const membership = await Membership.findById(membershipId);
    if (!membership) {
      return NextResponse.json(
        { success: false, error: 'Membership record not found.' },
        { status: 404 }
      );
    }

    // 4. Update the membership status to ACTIVE and PAID
    membership.planStatus = 'ACTIVE';
    membership.paymentStatus = 'PAID';
    membership.paymentMethod = 'IN_PERSON';
    membership.paymentDetails = paymentDetails;
    membership.planStartDate = new Date();
    
    const planEndDate = new Date();
    planEndDate.setFullYear(planEndDate.getFullYear() + 1); // 1 year expiry
    membership.planEndDate = planEndDate;

    await membership.save();

    // 5. Upgrade the Customer document
    const customer = await Customer.findById(membership.customerId);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Associated Customer document not found.' },
        { status: 404 }
      );
    }

    // Perform the plan upgrade using our standard helper utility
    await createOrUpdateCustomerPlan({
      phone: customer.phone,
      name: membership.verifiedName,
      planType: membership.planType,
    });

    // Update the Customer plan start/end dates
    await Customer.updateOne(
      { _id: customer._id },
      {
        $set: {
          planStatus: 'ACTIVE',
          planStartDate: membership.planStartDate,
          planEndDate: membership.planEndDate,
        }
      }
    );

    console.log(`[Admin Payment Verification] Active status set for customer: ${customer.phone}, plan: ${membership.planType}`);

    return NextResponse.json({
      success: true,
      message: 'Payment received. Membership activated successfully.',
      membership: {
        id: membership._id.toString(),
        planStatus: membership.planStatus,
        paymentStatus: membership.paymentStatus,
        verifiedName: membership.verifiedName,
      }
    });

  } catch (error) {
    console.error('❌ POST /api/admin/memberships/mark-paid error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment verification.', details: error.message },
      { status: 500 }
    );
  }
}
