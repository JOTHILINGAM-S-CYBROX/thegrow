import dbConnect from '@/lib/db';
import WhatsAppAuth from '@/models/WhatsAppAuth';
import Customer from '@/models/Customer';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();

    const { phone, verificationCode } = await request.json();

    // Validate inputs
    if (!phone || !verificationCode) {
      return Response.json(
        { success: false, message: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    // Format phone
    const formattedPhone = phone.replace(/\D/g, '');

    // Find auth record
    const authRecord = await WhatsAppAuth.findOne({
      phone: formattedPhone,
      verificationCode,
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
      });
    }

    // Generate JWT token
    const token = generateToken(formattedPhone);

    return Response.json(
      {
        success: true,
        message: 'Phone verified successfully',
        customerId: customer._id,
        token,
        customer: {
          id: customer._id,
          phone: customer.phone,
          name: customer.name,
          planType: customer.planType,
        },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `userToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
        },
      }
    );
  } catch (error) {
    console.error('Verify WhatsApp code error:', error);
    return Response.json(
      { success: false, message: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
