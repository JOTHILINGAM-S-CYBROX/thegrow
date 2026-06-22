import { NextResponse } from 'next/server';
import { getSystemSettings } from '@/utils/settings';

// Ensure this route is dynamic so it reads the latest DB settings
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getSystemSettings();
    return NextResponse.json({
      success: true,
      settings: {
        foodOrderingEnabled: settings.foodOrderingEnabled,
        membershipEnabled: settings.membershipEnabled,
        tableBookingEnabled: settings.tableBookingEnabled,
        eventBookingEnabled: settings.eventBookingEnabled,
      },
    });
  } catch (error) {
    console.error('❌ GET /api/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve system settings' },
      { status: 500 }
    );
  }
}
