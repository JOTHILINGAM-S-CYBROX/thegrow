import dbConnect from '@/lib/db';
import Menu from '@/models/Menu';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const subCategory = searchParams.get('subCategory');

    const skip = (page - 1) * limit;
    const query = subCategory ? { subCategory } : {};

    const [menus, total] = await Promise.all([
      Menu.find(query).skip(skip).limit(limit).lean(),
      Menu.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      menus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { name, description, price, category, imageUrl } = await request.json();

    // Validation
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const menu = await Menu.create({
      name,
      description,
      price: parseFloat(price),
      category,
      imageUrl,
    });

    console.log('✅ Menu item created:', menu._id);
    return NextResponse.json(
      { success: true, menu, message: 'Menu item created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
