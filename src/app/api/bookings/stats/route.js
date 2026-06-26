import dbConnect from '@/lib/db';
import VenueBooking from '@/models/VenueBooking';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminToken = request.cookies.get('adminToken');

    if (!adminToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Aggregate counts by paymentStatus
    const statsResult = await VenueBooking.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    const stats = {
      Pending: 0,
      Confirmed: 0,
      'Advance Paid': 0,
      'Fully Paid': 0,
      Completed: 0,
      Cancelled: 0,
    };

    statsResult.forEach(item => {
      if (stats[item._id] !== undefined) {
        stats[item._id] = item.count;
      }
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking stats' },
      { status: 500 }
    );
  }
}
