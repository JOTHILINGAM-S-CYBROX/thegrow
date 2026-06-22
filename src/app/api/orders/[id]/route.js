import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getCustomerSummary } from '@/utils/planComparison';
import { sendOrderReadyNotification } from '@/lib/whatsapp';
import { NextResponse } from 'next/server';

/**
 * GET /api/orders/[id]
 * Fetch a single order by ID with customer plan details
 */
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    console.log('📍 GET /api/orders/[id] called with ID:', id);

    const order = await Order.findById(id)
      .populate('items.menuItemId', 'name price description')
      .lean();

    if (!order) {
      console.error('❌ Order not found with ID:', id);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get customer plan details
    const customerSummary = await getCustomerSummary(order.customerInfo.phone);

    return NextResponse.json({
      success: true,
      order,
      customerPlanInfo: customerSummary,
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Update an order status, payment, or notes
 */
export async function PUT(request, { params }) {
  try {
    console.log('🔴 PUT ROUTE HANDLER CALLED');
    console.log('  Full params object:', JSON.stringify(params));
    console.log('  params keys:', Object.keys(params || {}));
    
    await dbConnect();
    
    // Try different ways to get the ID
    const idFromParams = params?.id;
    const url = request.url;
    const urlMatch = url.match(/\/api\/orders\/([a-f0-9]{24})/);
    const idFromUrl = urlMatch ? urlMatch[1] : null;
    
    console.log('  ID from params:', idFromParams);
    console.log('  ID from URL regex:', idFromUrl);
    console.log('  Request URL:', url);
    
    const id = idFromParams || idFromUrl;
    
    if (!id) {
      console.error('❌ No ID found in params or URL');
      return NextResponse.json(
        { success: false, error: 'No order ID provided' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    console.log('  Using ID:', id);
    console.log('  New status:', body.status);

    const order = await Order.findById(id);
    if (!order) {
      const allOrders = await Order.find({}).select('_id orderNumber status');
      console.error('❌ Order not found with ID:', id);
      console.log('  Orders in database:', allOrders.length);
      allOrders.forEach((o, i) => {
        console.log(`    [${i}] _id: ${o._id}, orderNumber: ${o.orderNumber}`);
      });
      
      return NextResponse.json(
        { success: false, error: `Order not found with ID: ${id}` },
        { status: 404 }
      );
    }

    console.log('  ✅ Order found:', order.orderNumber);

    const allowedUpdates = [
      'status',
      'paymentStatus',
      'paymentMethod',
      'notes',
      'tableNumber',
    ];

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        order[field] = body[field];
      }
    });

    if (body.status === 'Completed' && !order.completedAt) {
      order.completedAt = new Date();
    }

    order.updatedAt = Date.now();

    const updatedOrder = await order.save();

    // Send notification if status changed to Ready
    if (body.status === 'Ready' && updatedOrder.customerInfo?.phone) {
      sendOrderReadyNotification(updatedOrder.customerInfo.phone, updatedOrder.orderNumber || updatedOrder._id).catch(console.error);
    }

    console.log('✅ Order updated:', order.orderNumber, '→ Status:', updatedOrder.status);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[id]
 * Cancel an order (soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const order = await Order.findByIdAndUpdate(
      id,
      { status: 'Cancelled', updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ Order cancelled:', order.orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('❌ Error deleting order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
