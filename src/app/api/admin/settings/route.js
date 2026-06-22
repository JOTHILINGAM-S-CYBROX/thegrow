import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SystemSettings from '@/models/SystemSettings';

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

    // 2. Parse body
    const body = await request.json();
    const { foodOrderingEnabled, membershipEnabled, tableBookingEnabled, eventBookingEnabled } = body;

    // Build update object
    const updateData = {};
    if (typeof foodOrderingEnabled === 'boolean') {
      updateData.foodOrderingEnabled = foodOrderingEnabled;
    }
    if (typeof membershipEnabled === 'boolean') {
      updateData.membershipEnabled = membershipEnabled;
    }
    if (typeof tableBookingEnabled === 'boolean') {
      updateData.tableBookingEnabled = tableBookingEnabled;
    }
    if (typeof eventBookingEnabled === 'boolean') {
      updateData.eventBookingEnabled = eventBookingEnabled;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid setting fields provided to update.' },
        { status: 400 }
      );
    }

    // 3. Update the config in DB
    const settings = await SystemSettings.findOneAndUpdate(
      { key: 'system_config' },
      { $set: updateData },
      { upsert: true, new: true }
    );

    console.log(`[Admin settings update] Config set to: foodOrderingEnabled=${settings.foodOrderingEnabled}, membershipEnabled=${settings.membershipEnabled}, tableBookingEnabled=${settings.tableBookingEnabled}, eventBookingEnabled=${settings.eventBookingEnabled}`);

    return NextResponse.json({
      success: true,
      message: 'System configuration updated successfully.',
      settings: {
        foodOrderingEnabled: settings.foodOrderingEnabled,
        membershipEnabled: settings.membershipEnabled,
        tableBookingEnabled: settings.tableBookingEnabled,
        eventBookingEnabled: settings.eventBookingEnabled,
      }
    });

  } catch (error) {
    console.error('❌ POST /api/admin/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update system settings.', details: error.message },
      { status: 500 }
    );
  }
}
