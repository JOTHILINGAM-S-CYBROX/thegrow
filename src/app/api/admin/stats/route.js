import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import VenueBooking from '@/models/VenueBooking';
import Customer from '@/models/Customer';

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

    // Run aggregations and counts in parallel
    const [
      totalOrders,
      totalBookings,
      totalCustomers,
      revenueResult
    ] = await Promise.all([
      Order.countDocuments(),
      VenueBooking.countDocuments(),
      Customer.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalBookings,
        totalCustomers,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
