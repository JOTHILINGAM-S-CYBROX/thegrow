import dbConnect from '@/lib/db';
import WhatsAppAuth from '@/models/WhatsAppAuth';
import { sendVerificationCode } from '@/lib/whatsapp';

// Redirect old SMS OTP to WhatsApp auth
export async function POST(request) {
  try {
    await dbConnect();

    const { phone } = await request.json();

    // Validate phone
    if (!phone || typeof phone !== 'string') {
      return Response.json(
        { success: false, message: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length < 10) {
      return Response.json(
        { success: false, message: 'Phone number must be at least 10 digits' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

    // Delete existing auth records for this phone
    await WhatsAppAuth.deleteMany({ phone: formattedPhone });

    // Create new WhatsApp auth record
    const authRecord = await WhatsAppAuth.create({
      phone: formattedPhone,
      verificationCode,
      isVerified: false,
    });

    // Log code to console for local testing when WhatsApp is not configured
    console.log('\n======================================================');
    console.log(`🔑 [OTP DEBUG] Code for ${formattedPhone}: ${verificationCode}`);
    console.log('======================================================\n');

    // Send verification code via WhatsApp
    await sendVerificationCode(formattedPhone, verificationCode);

    return Response.json(
      {
        success: true,
        message: 'Verification code sent to WhatsApp',
        expiresIn: 900, // 15 minutes
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send WhatsApp verification error:', error);
    return Response.json(
      { success: false, message: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
