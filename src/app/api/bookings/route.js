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
  console.log('--- GET /api/bookings CALLED ---');
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerPhone = searchParams.get('phone');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') || '-createdAt';

    console.log(`GET /api/bookings Params -> status: ${status}, phone: ${customerPhone}, page: ${page}, limit: ${limit}`);

    // Build query filter
    const filter = {};
    if (status) {
      filter.paymentStatus = status;
    }
    if (customerPhone) {
      filter['customerInfo.phone'] = customerPhone;
    }

    console.log('GET /api/bookings Filter ->', JSON.stringify(filter));

    // Get total count
    const total = await VenueBooking.countDocuments(filter);

    // Fetch bookings with sorting and pagination
    const bookings = await VenueBooking.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Admin loading from collection:", VenueBooking.collection.name);
    console.log("Records returned:", bookings.length);

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
  console.log('--- POST /api/bookings CALLED ---');
  try {
    await dbConnect();

    const body = await request.json();
    console.log('POST /api/bookings Body ->', JSON.stringify(body, null, 2));

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

    if (body.venue === 'Roof Top' && parseInt(body.guestCount, 10) > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Roof Top venue has a maximum capacity of 50 guests.',
        },
        { status: 400 }
      );
    }

    // Validate past dates
    const selectedDateObj = new Date(body.eventDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (selectedDateObj < todayObj) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking creation failed: Event date cannot be in the past',
        },
        { status: 400 }
      );
    }

    const isToday = selectedDateObj.getTime() === todayObj.getTime();
    if (isToday && body.timeSlot) {
      let timeMins = 24 * 60; // Default to end of day if unparseable
      
      if (body.timeSlot === 'Full Day') {
        timeMins = 11 * 60;
      } else if (body.timeSlot === 'Custom Timing') {
        timeMins = 23 * 60 + 59;
      } else if (body.timeSlot.includes('AM') || body.timeSlot.includes('PM')) {
        const match = body.timeSlot.match(/(\d+):(\d+)\s+(AM|PM)/);
        if (match) {
          let [_, h, m, mod] = match;
          let hours = parseInt(h, 10);
          if (mod === 'PM' && hours !== 12) hours += 12;
          if (mod === 'AM' && hours === 12) hours = 0;
          timeMins = hours * 60 + parseInt(m, 10);
        }
      } else if (body.timeSlot.includes(':')) {
        const [h, m] = body.timeSlot.split(':');
        timeMins = parseInt(h, 10) * 60 + parseInt(m, 10);
      }

      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();

      if ((currentMins + 30) > timeMins) {
        return NextResponse.json(
          {
            success: false,
            error: 'Booking creation failed: Selected time slot has already passed or is too soon.',
          },
          { status: 400 }
        );
      }
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
    
    console.log("Created booking:", savedBooking);

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
