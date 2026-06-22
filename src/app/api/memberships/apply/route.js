import { NextResponse } from 'next/server';
import { extractUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';
import Membership from '@/models/Membership';
import PricingPlan from '@/models/PricingPlan';
import fs from 'fs';
import path from 'path';
import { isFeatureEnabled } from '@/utils/settings';

function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export async function POST(request) {
  try {
    // Check if memberships are enabled
    if (!(await isFeatureEnabled('membershipEnabled'))) {
      return NextResponse.json(
        { success: false, message: 'Membership registration is currently disabled.' },
        { status: 403 }
      );
    }

    // 1. Authenticate user from session
    const userFromAuth = extractUserFromRequest(request);
    if (!userFromAuth) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please verify your phone number first.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find customer in database
    const customer = await Customer.findOne({ phone: userFromAuth.phone });
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer profile not found.' },
        { status: 404 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const planType = formData.get('planType'); // 'BASIC' (Saver) or 'PREMIUM' (Elite)
    const name = formData.get('name');
    const dobString = formData.get('dob'); // e.g. '1995-04-12' or '12/04/1995'
    const aadhaarLastFour = formData.get('aadhaarLastFour');
    const file = formData.get('file');
    const paymentStatus = formData.get('paymentStatus') || 'PAID';
    const paymentMethod = formData.get('paymentMethod') || 'ONLINE';

    if (!planType || !name || !dobString || !aadhaarLastFour || !file) {
      return NextResponse.json(
        { success: false, message: 'All fields (planType, name, dob, aadhaarLastFour, file) are required.' },
        { status: 400 }
      );
    }

    // 3. Parse DOB and verify age in backend (defensive check)
    let dobDate;
    if (dobString.includes('/')) {
      // DD/MM/YYYY format
      const [day, month, year] = dobString.split('/');
      dobDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // YYYY-MM-DD or other standard format
      dobDate = new Date(dobString);
    }

    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid Date of Birth format.' },
        { status: 400 }
      );
    }

    const age = calculateAge(dobDate);
    if (age < 21) {
      return NextResponse.json(
        { success: false, message: 'Access Denied. Membership is restricted to individuals aged 21 and above due to liquor regulations.' },
        { status: 403 }
      );
    }

    // 4. Securely save the file in a separate folder for memberships (secure-memberships)
    const uploadDir = path.join(process.cwd(), 'secure-memberships');
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Extract file extension
    const originalFilename = file.name || 'document.webp';
    let ext = path.extname(originalFilename);
    if (!ext) {
      // fallback based on file type
      ext = file.type === 'image/png' ? '.webp' : '.webp';
    }

    // Sanitize name for filename
    const sanitizedName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');
    const secureFilename = `${customer.customerNumber}_${sanitizedName}_aadhaar${ext}`;
    const secureFilePath = path.join(uploadDir, secureFilename);

    // Write file buffer to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(secureFilePath, buffer);

    console.log(`[File Save] Saved securely to: ${secureFilePath}`);

    // 5. Create or Update Membership Document (separate collection)
    const planStartDate = new Date();
    const planEndDate = new Date();
    planEndDate.setFullYear(planEndDate.getFullYear() + 1); // 1 year duration

    const isMembershipPaid = paymentStatus === 'PAID';
    const planStatus = isMembershipPaid ? 'ACTIVE' : 'INACTIVE';

    await Membership.findOneAndUpdate(
      { customerId: customer._id },
      {
        customerId: customer._id,
        customerNumber: customer.customerNumber,
        planType,
        planStatus,
        paymentStatus,
        paymentMethod,
        planStartDate,
        planEndDate,
        verifiedName: name.trim(),
        dob: dobDate,
        age,
        aadhaarLastFour,
        aadhaarImage: secureFilename,
        isAgeVerified: true,
      },
      { upsert: true, new: true }
    );

    // Only update Customer plan details if payment has been received (PAID)
    if (isMembershipPaid) {
      // Fetch the target plan to update features/limits on the customer record
      const plan = await PricingPlan.findOne({ planType, isActive: true });
      let planFeatures = {};
      if (plan) {
        planFeatures = plan.features;
        planFeatures.maxOrdersPerMonth = plan.limits.maxOrdersPerMonth;
        planFeatures.maxBookingsPerMonth = plan.limits.maxBookingsPerMonth;
        planFeatures.discountPercentage = plan.discounts.orderDiscount;
      } else {
        // Set defaults if plan document is missing
        planFeatures = {
          maxOrdersPerMonth: planType === 'PREMIUM' ? 20 : 10,
          maxBookingsPerMonth: planType === 'PREMIUM' ? 5 : 2,
          discountPercentage: planType === 'PREMIUM' ? 15 : 10,
          priorityLevel: planType === 'PREMIUM' ? 'VIP' : 'PRIORITY',
          freeDelivery: planType === 'PREMIUM',
        };
      }

      await Customer.updateOne(
        { _id: customer._id },
        {
          $set: {
            name: name.trim(),
            planType,
            planStatus: 'ACTIVE',
            planStartDate,
            planEndDate,
            planFeatures,
          }
        }
      );
      console.log(`[DB Update] Customer ${customer.customerNumber} plan updated to ${planType}`);
    } else {
      console.log(`[DB Update] Customer ${customer.customerNumber} plan NOT upgraded (Payment is ${paymentStatus})`);
    }

    return NextResponse.json({
      success: true,
      message: isMembershipPaid
        ? 'Membership registered and activated successfully.'
        : 'Membership registration submitted. Payment pending confirmation.',
      customer: {
        customerNumber: customer.customerNumber,
        name: name.trim(),
        phone: customer.phone,
        planType: isMembershipPaid ? planType : 'FREE',
        planStatus: isMembershipPaid ? 'ACTIVE' : 'INACTIVE',
        isAgeVerified: true,
        paymentStatus,
      }
    });

  } catch (error) {
    console.error('❌ Apply membership error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process membership application.', error: error.message },
      { status: 500 }
    );
  }
}
