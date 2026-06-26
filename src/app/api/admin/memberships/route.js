import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Membership from '@/models/Membership';
import Customer from '@/models/Customer'; // Required for populate() referencing

export async function GET(request) {
  try {
    // 1. Verify admin session cookie
    const adminToken = request.cookies.get('adminToken')?.value;
    if (adminToken !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Fetch all membership records and populate customer reference details
    const memberships = await Membership.find({})
      .populate('customerId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      members: memberships.map(m => ({
        id: m._id.toString(),
        customerNumber: m.customerNumber,
        name: m.verifiedName, // Use verified name directly from membership card
        phone: m.customerId?.phone || 'N/A', // Pulled from populated Customer reference

        planType: m.planType,
        planStatus: m.planStatus,
        planStartDate: m.planStartDate,
        planEndDate: m.planEndDate,
        dob: m.dob,
        isAgeVerified: m.isAgeVerified,
        aadhaarLastFour: m.aadhaarLastFour,
        aadhaarImage: m.aadhaarImage,
        paymentStatus: m.paymentStatus || 'PAID',
        paymentMethod: m.paymentMethod || 'ONLINE',
        paymentDetails: m.paymentDetails || '',
        createdAt: m.createdAt,
      }))
    });

  } catch (error) {
    console.error('❌ Fetch memberships API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve memberships list.', details: error.message },
      { status: 500 }
    );
  }
}
