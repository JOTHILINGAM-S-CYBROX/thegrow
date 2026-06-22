import dbConnect from '@/lib/db';
import WhatsAppAuth from '@/models/WhatsAppAuth';
import Customer from '@/models/Customer';
import { generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Redirect old OTP verification to WhatsApp auth
export async function POST(request) {
  try {
    await dbConnect();

    const { phone, otp } = await request.json();

    // Validate inputs
    if (!phone || !otp) {
      return Response.json(
        { success: false, message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Format phone
    const formattedPhone = phone.replace(/\D/g, '');

    // Find auth record
    const authRecord = await WhatsAppAuth.findOne({
      phone: formattedPhone,
      verificationCode: otp,
    });

    if (!authRecord) {
      // Increment attempts
      const attempted = await WhatsAppAuth.findOne({ phone: formattedPhone });
      if (attempted) {
        attempted.attempts += 1;
        if (attempted.attempts >= 5) {
          await WhatsAppAuth.deleteOne({ _id: attempted._id });
          return Response.json(
            { success: false, message: 'Too many attempts. Request a new code.' },
            { status: 429 }
          );
        }
        await attempted.save();
      }
      return Response.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (authRecord.isVerified) {
      return Response.json(
        { success: false, message: 'Code already used' },
        { status: 400 }
      );
    }

    // Check expiry (should be auto-deleted by MongoDB TTL)
    const createdTime = new Date(authRecord.createdAt).getTime();
    const currentTime = Date.now();
    if (currentTime - createdTime > 900000) { // 15 minutes
      await WhatsAppAuth.deleteOne({ _id: authRecord._id });
      return Response.json(
        { success: false, message: 'Code expired' },
        { status: 400 }
      );
    }

    // Mark as verified
    authRecord.isVerified = true;
    await authRecord.save();

    // Find or create customer
    let customer = await Customer.findOne({ phone: formattedPhone });

    if (!customer) {
      const customerNumber = `CUST${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      customer = await Customer.create({
        customerNumber,
        name: `Customer ${formattedPhone}`,
        phone: formattedPhone,
        planType: 'FREE',
        planStatus: 'ACTIVE',
        planFeatures: {
          maxOrdersPerMonth: 5,
          maxBookingsPerMonth: 1,
          discountPercentage: 0,
          priorityLevel: 'STANDARD',
          freeDelivery: false,
        },
        usageMetrics: {
          ordersThisMonth: 0,
          bookingsThisMonth: 0,
          totalSpent: 0,
          totalOrders: 0,
          totalBookings: 0,
        },
        loyaltyPoints: 0,
      });
    }

    // Generate JWT token
    const token = generateToken(formattedPhone);

    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'Verified successfully',
      customerId: customer._id,
      customer,
    });

    response.cookies.set('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error) {
    console.error('Verify WhatsApp code error:', error);
    return Response.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    );
  }
}
