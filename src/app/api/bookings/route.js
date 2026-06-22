import dbConnect from '@/lib/db';
import VenueBooking from '@/models/VenueBooking';
import {
  validateBookingAgainstPlan,
  getCustomerByPhone,
  updateCustomerUsage,
  createOrUpdateCustomerPlan,
} from '@/utils/planComparison';
import { sendBookingConfirmation, sendOrderNotificationToOwners } from '@/lib/whatsapp';
import { NextResponse } from 'next/server';

/**
 * GET /api/bookings
 * Fetch all bookings with optional filtering
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerPhone = searchParams.get('phone');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') || '-createdAt';

    // Build query filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (customerPhone) {
      filter['customerInfo.phone'] = customerPhone;
    }

    // Get total count
    const total = await VenueBooking.countDocuments(filter);

    // Fetch bookings with sorting and pagination
    const bookings = await VenueBooking.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bookings
 * Create a new booking with plan validation
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.eventName || !body.eventType || !body.guestCount || !body.eventDate) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: eventName, eventType, guestCount, eventDate',
        },
        { status: 400 }
      );
    }

    if (!body.customerInfo?.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer phone number is required' },
        { status: 400 }
      );
    }

    const customerPhone = body.customerInfo.phone;

    // Validate against customer's phone plan
    const planValidation = await validateBookingAgainstPlan(customerPhone, {
      guestCount: body.guestCount,
      totalCost: body.totalCost || 0,
      decorationRequested: body.decorationRequested || false,
    });

    if (!planValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: planValidation.errors[0],
          validationDetails: planValidation,
        },
        { status: 400 }
      );
    }

    // Create or update customer
    await createOrUpdateCustomerPlan({
      phone: customerPhone,
      name: body.customerInfo.name || 'Customer',
      email: body.customerInfo.email,
      address: body.customerInfo.address,
    });

    // Generate unique booking number
    const bookingCount = await VenueBooking.countDocuments();
    const bookingNumber = `BK${String(10000 + bookingCount + 1)}`;

    // Create new booking with final cost after discount
    const newBooking = new VenueBooking({
      bookingNumber,
      eventName: body.eventName,
      eventType: body.eventType,
      guestCount: body.guestCount,
      eventDate: new Date(body.eventDate),
      timeSlot: body.timeSlot || '',
      duration: body.duration || 3,
      venue: body.venue || 'Indoor',
      customerInfo: body.customerInfo,
      estimatedBudget: body.estimatedBudget || 0,
      totalCost: planValidation.finalPrice, // Apply discount
      originalCost: body.totalCost || 0,
      discount: planValidation.applicableDiscounts.discountPercentage,
      discountAmount: planValidation.applicableDiscounts.discountAmount,
      status: body.status || 'Pending',
      specialRequests: body.specialRequests || '',
      menuPreferences: body.menuPreferences || '',
      decorationRequested: body.decorationRequested || false,
      cateringDetails: body.cateringDetails || '',
      paymentStatus: body.paymentStatus || 'Pending',
      advanceAmount: body.advanceAmount || 0,
      notes: body.notes || '',
      planType: planValidation.customerInfo?.planType || 'FREE',
    });

    const savedBooking = await newBooking.save();

    // Update customer usage
    await updateCustomerUsage(
      customerPhone,
      'booking',
      planValidation.finalPrice
    );

    // Send WhatsApp Notifications non-blocking
    Promise.all([
      sendBookingConfirmation(customerPhone, savedBooking),
      sendOrderNotificationToOwners(savedBooking)
    ]).catch(console.error);

    console.log('✅ Venue booking created:', bookingNumber);

    return NextResponse.json(
      {
        success: true,
        message: 'Booking created successfully',
        booking: savedBooking,
        appliedDiscount: planValidation.applicableDiscounts,
        planInfo: planValidation.planInfo,
        warnings: planValidation.warnings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
