import dbConnect from '@/lib/db';
import VenueBooking from '@/models/VenueBooking';
import { 
  sendBookingStatusNotification, 
  sendBookingPaymentNotification,
  sendOrderNotificationToOwners 
} from '@/lib/whatsapp';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const booking = await VenueBooking.findById(id).lean();
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Check if booking exists
    const booking = await VenueBooking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Store old values for comparison
    const oldStatus = booking.status;
    const oldPaymentStatus = booking.paymentStatus;

    // Update allowed fields
    const allowedFields = [
      'status',
      'eventName',
      'eventType',
      'guestCount',
      'eventDate',
      'timeSlot',
      'duration',
      'venue',
      'customerInfo',
      'estimatedBudget',
      'totalCost',
      'specialRequests',
      'menuPreferences',
      'decorationRequested',
      'cateringDetails',
      'paymentStatus',
      'advanceAmount',
      'notes',
    ];

    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        booking[key] = body[key];
      }
    });

    // Mark as confirmed if status is Confirmed
    if (body.status === 'Confirmed' && !booking.confirmedAt) {
      booking.confirmedAt = new Date();
    }

    // Mark as completed if status is Completed
    if (body.status === 'Completed' && !booking.completedAt) {
      booking.completedAt = new Date();
    }

    const updatedBooking = await booking.save();
    console.log('✅ Booking updated:', id);

    // Send WhatsApp notifications based on changes
    const customerPhone = booking.customerInfo?.phone;
    
    if (customerPhone) {
      // Send status notification if status changed
      if (body.status && body.status !== oldStatus) {
        sendBookingStatusNotification(customerPhone, updatedBooking).catch(console.error);
      }

      // Send payment notification if payment status changed
      if (body.paymentStatus && body.paymentStatus !== oldPaymentStatus) {
        sendBookingPaymentNotification(customerPhone, updatedBooking).catch(console.error);
      }
    }

    // Notify owners about status changes
    if (body.status && body.status !== oldStatus) {
      sendOrderNotificationToOwners(updatedBooking).catch(console.error);
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const booking = await VenueBooking.findByIdAndDelete(id);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log('✅ Booking deleted:', id);
    return NextResponse.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
