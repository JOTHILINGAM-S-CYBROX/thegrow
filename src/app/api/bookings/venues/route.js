import { NextResponse } from 'next/server';
import VenueBooking from '@/models/VenueBooking';
import dbConnect from '@/lib/db';

export async function GET(request) {
  try {
    await dbConnect();
    const venueOptions = VenueBooking.schema.path('venue').enumValues;
    const defaultVenue = VenueBooking.schema.path('venue').defaultValue;
    
    return NextResponse.json({
      success: true,
      options: venueOptions,
      defaultOption: defaultVenue
    });
  } catch (error) {
    console.error('Error fetching venue options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch venue options' },
      { status: 500 }
    );
  }
}
