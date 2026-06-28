import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import { extractUserFromRequest } from '@/lib/auth';
import {
  validateOrderAgainstPlan,
  getCustomerByPhone,
  updateCustomerUsage,
  createOrUpdateCustomerPlan,
} from '@/utils/planComparison';
import { sendOrderConfirmation, sendOrderNotificationToOwners } from '@/lib/whatsapp';
import { NextResponse } from 'next/server';
import { isFeatureEnabled } from '@/utils/settings';

/**
 * GET /api/orders
 * Fetch orders for authenticated user (customer) or kitchen staff (all orders)
 */
export async function GET(request) {
  try {
    // Check for admin authentication
    const adminToken = request.cookies.get('adminToken');
    const isAdmin = !!adminToken;

    // Check for kitchen staff authentication
    const kitchenToken = request.cookies.get('kitchenToken');
    const isKitchenStaff = !!kitchenToken;

    // If not admin or kitchen staff, check for customer authentication
    let userFromAuth = null;
    if (!isAdmin && !isKitchenStaff) {
      userFromAuth = extractUserFromRequest(request);
      if (!userFromAuth) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized - Please login' },
          { status: 401 }
        );
      }
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') || '-createdAt';

    // Build query filter
    // Admins and Kitchen staff see all orders, customers see only their orders
    let filter = {};
    if (!isAdmin && !isKitchenStaff) {
      filter['customerInfo.phone'] = userFromAuth.phone;
    }
    
    if (status) {
      filter.status = status;
    }

    // Get total count
    const total = await Order.countDocuments(filter);

    // Fetch orders with sorting and pagination
    const orders = await Order.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);
    
    // Explicitly map to include _id
    const ordersWithId = orders.map(order => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      items: order.items,
      totalPrice: order.totalPrice,
      originalPrice: order.originalPrice,
      discount: order.discount,
      status: order.status,
      customerInfo: order.customerInfo,
      scheduledTime: order.scheduledTime,
      createdAt: order.createdAt,
    }));

    return NextResponse.json({
      success: true,
      orders: ordersWithId,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order for authenticated user with plan validation
 */
export async function POST(request) {
  try {
    // Check if food ordering is enabled
    if (!(await isFeatureEnabled('foodOrderingEnabled'))) {
      return NextResponse.json(
        { success: false, error: 'Food ordering is currently disabled.' },
        { status: 403 }
      );
    }

    // Extract authenticated user
    const userFromAuth = extractUserFromRequest(request);
    if (!userFromAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to place an order' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();

    // Validate required fields
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Use authenticated user's phone instead
    const customerPhone = userFromAuth.phone;
    const totalPrice = body.totalPrice || 0;

    // Validate against customer's phone plan
    const planValidation = await validateOrderAgainstPlan(customerPhone, {
      totalPrice,
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

    // Create or update customer with authenticated phone
    await createOrUpdateCustomerPlan({
      phone: customerPhone,
      name: body.customerInfo?.name || `Customer ${customerPhone}`,

    });

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${String(10000 + orderCount + 1)}`;

    // Build customerInfo with authenticated phone
    const customerInfo = {
      phone: customerPhone,
      name: body.customerInfo?.name || `Customer ${customerPhone}`,

      ...body.customerInfo,
    };

    // Map items to match OrderSchema
    const mappedItems = body.items.map(item => ({
      menuItemId: item._id || item.menuItemId,
      itemName: item.name || item.itemName,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }));

    // Create new order with final price after discount
    const newOrder = new Order({
      orderNumber,
      items: mappedItems,
      totalPrice: planValidation.finalPrice, // Apply discount
      originalPrice: totalPrice,
      discount: planValidation.applicableDiscounts.discountPercentage,
      discountAmount: planValidation.applicableDiscounts.discountAmount,
      customerInfo,
      scheduledTime: body.scheduledTime || 'now',
      paymentStatus: body.paymentStatus || 'Pending',
      paymentMethod: body.paymentMethod || 'Cash',
      orderType: body.orderType || 'Dine-in',
      tableNumber: body.tableNumber || '',
      notes: body.notes || '',
      planType: planValidation.customerInfo?.planType || 'FREE',
    });

    const savedOrder = await newOrder.save();

    // Update customer usage
    await updateCustomerUsage(
      customerPhone,
      'order',
      planValidation.finalPrice
    );

    // Send WhatsApp Notifications non-blocking
    Promise.all([
      sendOrderConfirmation(customerPhone, savedOrder),
      sendOrderNotificationToOwners(savedOrder)
    ]).catch(console.error);

    console.log('✅ Order created:', orderNumber, 'for customer:', customerPhone);

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order: savedOrder,
        appliedDiscount: planValidation.applicableDiscounts,
        planInfo: planValidation.planInfo,
        warnings: planValidation.warnings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
