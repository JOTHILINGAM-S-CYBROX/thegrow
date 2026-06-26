import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminToken = request.cookies.get('adminToken');
    const kitchenToken = request.cookies.get('kitchenToken');

    if (!adminToken && !kitchenToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Aggregate counts by status
    const statsResult = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
      Pending: 0,
      Preparing: 0,
      Ready: 0,
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
    console.error('Error fetching order stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order stats' },
      { status: 500 }
    );
  }
}
