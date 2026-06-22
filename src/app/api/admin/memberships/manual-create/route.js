import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Membership from '@/models/Membership';
import Customer from '@/models/Customer';
import { createOrUpdateCustomerPlan } from '@/utils/planComparison';
import fs from 'fs';
import path from 'path';

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
    // 1. Verify admin session cookie
    const adminToken = request.cookies.get('adminToken')?.value;
    if (adminToken !== 'authenticated') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Parse form data
    const formData = await request.formData();
    const phone = formData.get('phone');
    const name = formData.get('name');
    const dobString = formData.get('dob'); // YYYY-MM-DD
    const aadhaarLastFour = formData.get('aadhaarLastFour');
    const planType = formData.get('planType');
    const file = formData.get('file');

    if (!phone || !name || !dobString || !aadhaarLastFour || !planType || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (phone, name, dob, aadhaarLastFour, planType, file).' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be at least 10 digits.' },
        { status: 400 }
      );
    }

    let dobDate;
    if (dobString.includes('/')) {
      const [day, month, year] = dobString.split('/');
      dobDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      dobDate = new Date(dobString);
    }

    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid Date of Birth format.' },
        { status: 400 }
      );
    }

    const age = calculateAge(dobDate);
    if (age < 21) {
      return NextResponse.json(
        { success: false, error: 'Access Denied. Membership is restricted to individuals aged 21 and above.' },
        { status: 403 }
      );
    }

    // 3. Find or Create Customer
    let customer = await Customer.findOne({ phone: cleanPhone });
    if (!customer) {
      const customerCount = await Customer.countDocuments();
      const customerNumber = `CUST${String(10000 + customerCount + 1)}`;
      customer = new Customer({
        customerNumber,
        phone: cleanPhone,
        name: name.trim(),
        planType: 'FREE',
      });
      await customer.save();
      console.log(`[Manual Membership] Created new customer document: ${customer.customerNumber}`);
    }

    // 4. Securely save the Aadhaar card image to secure-memberships folder
    const uploadDir = path.join(process.cwd(), 'secure-memberships');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Extract file extension
    const originalFilename = file.name || 'document.webp';
    let ext = path.extname(originalFilename);
    if (!ext) {
      ext = file.type === 'image/png' ? '.webp' : '.webp';
    }

    const sanitizedName = name.trim().replace(/[^a-zA-Z0-9]/g, '_');
    const secureFilename = `${customer.customerNumber}_${sanitizedName}_aadhaar${ext}`;
    const secureFilePath = path.join(uploadDir, secureFilename);

    // Write file buffer to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(secureFilePath, buffer);

    console.log(`[File Save] Offline Aadhaar saved securely to: ${secureFilePath}`);

    // 5. Create or Update Membership
    const planStartDate = new Date();
    const planEndDate = new Date();
    planEndDate.setFullYear(planEndDate.getFullYear() + 1); // 1 year expiry

    const membership = await Membership.findOneAndUpdate(
      { customerId: customer._id },
      {
        customerId: customer._id,
        customerNumber: customer.customerNumber,
        planType,
        planStatus: 'ACTIVE',
        paymentStatus: 'PAID',
        paymentMethod: 'IN_PERSON',
        paymentDetails: 'Manual Registration by Admin (In-Person Payment)',
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

    // 6. Upgrade the Customer document details
    await createOrUpdateCustomerPlan({
      phone: customer.phone,
      name: name.trim(),
      planType,
    });

    // Update customer plan dates and status in DB
    await Customer.updateOne(
      { _id: customer._id },
      {
        $set: {
          planStatus: 'ACTIVE',
          planStartDate,
          planEndDate,
        }
      }
    );

    console.log(`[Manual Membership] Activated ${planType} plan for ${customer.phone} by Admin`);

    return NextResponse.json({
      success: true,
      message: 'Membership registered and activated successfully.',
      membership: {
        customerNumber: customer.customerNumber,
        name: name.trim(),
        phone: customer.phone,
        planType,
        planStatus: 'ACTIVE',
        paymentStatus: 'PAID',
      }
    });

  } catch (error) {
    console.error('❌ POST /api/admin/memberships/manual-create error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manually register membership.', details: error.message },
      { status: 500 }
    );
  }
}
