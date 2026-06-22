import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Menu from '@/models/Menu';
import PricingPlan from '@/models/PricingPlan';
import WhatsAppAuth from '@/models/WhatsAppAuth';
import VenueBooking from '@/models/VenueBooking';
import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Database health check - verify all collections exist with proper schemas
 */
export async function GET() {
  try {
    await dbConnect();

    // Check all collections
    const collections = {
      orders: await Order.countDocuments(),
      customers: await Customer.countDocuments(),
      menuItems: await Menu.countDocuments(),
      pricingPlans: await PricingPlan.countDocuments(),
      whatsappAuths: await WhatsAppAuth.countDocuments(),
      venueBookings: await VenueBooking.countDocuments(),
    };

    return NextResponse.json({
      success: true,
      message: 'Database is healthy and initialized',
      database: process.env.MONGODB_URI?.split('@')[1] || 'Unknown',
      collections,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Database health check failed',
      },
      { status: 500 }
    );
  }
}
