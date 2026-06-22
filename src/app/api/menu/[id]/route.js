import dbConnect from '@/lib/db';
import Menu from '@/models/Menu';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const menu = await Menu.findById(id);

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    // Allow updates for specific fields
    const allowedFields = ['name', 'description', 'price', 'category', 'subCategory', 'isVeg', 'isSpicy', 'isAvailable', 'imageUrl'];
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (field in updates) {
        if (field === 'price') {
          filteredUpdates[field] = parseFloat(updates[field]);
        } else {
          filteredUpdates[field] = updates[field];
        }
      }
    });

    const menu = await Menu.findByIdAndUpdate(
      id,
      { ...filteredUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    console.log('✅ Menu item updated:', id);
    return NextResponse.json({
      success: true,
      menu,
      message: 'Menu item updated successfully',
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid menu ID' },
        { status: 400 }
      );
    }

    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      );
    }

    console.log('✅ Menu item deleted:', id);
    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
