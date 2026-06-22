export async function sendSessionMessage(phone: string, messageText: string) {
  const url = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_API_TOKEN;

  if (!url || !token) {
    console.error("WhatsApp API URL or Token is missing in environment variables.");
    return;
  }

  try {
    const formattedPhone = phone.replace("+", ""); // WATI style might not need the plus
    const response = await fetch(`${url}/api/v1/sendSessionMessage/${formattedPhone}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageText }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`WhatsApp API Error: ${response.status} - ${errorData}`);
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
  }
}

export async function sendVerificationCode(phone: string, verificationCode: string) {
  const message = `*The Grove Restaurant* 🍽️\n\nYour verification code is:\n\n🔐 ${verificationCode}\n\nValid for 15 minutes.\n\nDo not share this code with anyone.`;
  await sendSessionMessage(phone, message);
}

export async function sendVerificationLink(phone: string, verificationLink: string) {
  const message = `*The Grove Restaurant* 🍽️\n\nClick below to verify your phone and proceed with your order:\n\n${verificationLink}\n\nLink expires in 15 minutes.`;
  await sendSessionMessage(phone, message);
}

export async function sendOrderConfirmation(phone: string, orderDetails: any) {
  try {
    const itemsList = orderDetails.items.map((item: any) => `• ${item.quantity}x ${item.itemName}`).join("\n");
    const message = `*The Grove Restaurant* 🍽️\n\n✅ *Order Confirmed!*\n\n📋 *Order ID:* ${orderDetails.orderNumber}\n\n*Items:*\n${itemsList}\n\n💰 *Total:* ₹${orderDetails.totalPrice}\n${orderDetails.discountAmount ? `💸 *Saved:* ₹${orderDetails.discountAmount} with ${orderDetails.planType} plan` : ''}\n\nThank you for ordering with us! 🙏`;
    await sendSessionMessage(phone, message);
  } catch (error) {
    console.error("sendOrderConfirmation error:", error);
  }
}

export async function sendOrderNotificationToOwners(orderDetails: any) {
  try {
    const ownerNumbers = process.env.WHATSAPP_OWNER_NUMBERS?.split(",") || [];
    if (ownerNumbers.length === 0) return;

    let itemsList = "";
    if (orderDetails.items && Array.isArray(orderDetails.items)) {
      itemsList = orderDetails.items.map((item: any) => `• ${item.quantity}x ${item.itemName}`).join("\n");
    }

    // For bookings context (re-using this function as requested)
    if (orderDetails.bookingNumber) {
      const message = `*🏷️ The Grove - New Booking*\n\n👤 *Customer:* ${orderDetails.customerInfo?.phone}\n📋 *Booking ID:* ${orderDetails.bookingNumber}\n🎉 *Event:* ${orderDetails.eventName}\n👥 *Guests:* ${orderDetails.guestCount}\n📅 *Date:* ${new Date(orderDetails.eventDate).toDateString()}\n💵 *Advance:* ₹${orderDetails.advanceAmount}\n💰 *Total:* ₹${orderDetails.totalCost}\n\n📱 View details: ${process.env.NEXT_PUBLIC_BASE_URL || ""}/admin`;
      await Promise.all(ownerNumbers.map((num) => sendSessionMessage(num.trim(), message)));
      return;
    }

    const message = `*📦 The Grove - New Order*\n\n👤 *Customer:* ${orderDetails.customerInfo?.phone}\n📋 *Order ID:* ${orderDetails.orderNumber || orderDetails._id}\n🕐 *Time:* ${new Date().toLocaleTimeString()}\n\n*Items:*\n${itemsList}\n\n💰 *Total:* ₹${orderDetails.totalPrice}\n\n📱 View details: ${process.env.NEXT_PUBLIC_BASE_URL || ""}/admin`;
    
    await Promise.all(ownerNumbers.map((num) => sendSessionMessage(num.trim(), message)));
  } catch (error) {
    console.error("sendOrderNotificationToOwners error:", error);
  }
}

export async function sendOrderReadyNotification(phone: string, orderId: string) {
  try {
    const message = `*The Grove Restaurant* 🍽️\n\n✅ *Your order is ready for pickup!*\n\n📋 *Order #${orderId}*\n\nThank you for your patience!`;
    await sendSessionMessage(phone, message);
  } catch (error) {
    console.error("sendOrderReadyNotification error:", error);
  }
}

export async function sendBookingConfirmation(phone: string, bookingDetails: any) {
  try {
    const message = `*The Grove Restaurant* 🍽️\n\n✅ *Booking Confirmed!* 📅\n\n📋 *Booking ID:* ${bookingDetails.bookingNumber}\n📅 *Event Date:* ${new Date(bookingDetails.eventDate).toDateString()}\n👥 *Guests:* ${bookingDetails.guestCount}\n💵 *Advance Paid:* ₹${bookingDetails.advanceAmount}\n✨ *Features:* ${bookingDetails.decorationRequested ? 'Premium with Decoration' : 'Standard'}\n\nWe look forward to hosting you! 🎉`;
    await sendSessionMessage(phone, message);
  } catch (error) {
    console.error("sendBookingConfirmation error:", error);
  }
}

export async function sendBookingStatusNotification(phone: string, bookingDetails: any) {
  try {
    const statusMessages = {
      'Confirmed': '✅ *Your booking has been confirmed!*',
      'Completed': '🎉 *Thank you for choosing The Grove!*',
      'Cancelled': '❌ *Your booking has been cancelled.*',
    };
    
    const statusMessage = statusMessages[bookingDetails.status] || `*Status Updated:* ${bookingDetails.status}`;
    
    const message = `*The Grove Restaurant* 🍽️\n\n${statusMessage}\n\n📋 *Booking ID:* ${bookingDetails.bookingNumber}\n📅 *Event Date:* ${new Date(bookingDetails.eventDate).toDateString()}\n👥 *Guests:* ${bookingDetails.guestCount}\n\nIf you have any questions, please contact us!`;
    await sendSessionMessage(phone, message);
  } catch (error) {
    console.error("sendBookingStatusNotification error:", error);
  }
}

export async function sendBookingPaymentNotification(phone: string, bookingDetails: any) {
  try {
    const paymentMessages = {
      'Advance Paid': '💳 *Advance payment received!*',
      'Fully Paid': '✅ *Payment completed!*',
      'Pending': '⏳ *Payment pending.*',
    };
    
    const paymentMessage = paymentMessages[bookingDetails.paymentStatus] || `*Payment Status:* ${bookingDetails.paymentStatus}`;
    
    const message = `*The Grove Restaurant* 🍽️\n\n${paymentMessage}\n\n📋 *Booking ID:* ${bookingDetails.bookingNumber}\n📅 *Event Date:* ${new Date(bookingDetails.eventDate).toDateString()}\n💰 *Amount:* ₹${bookingDetails.paymentStatus === 'Fully Paid' ? bookingDetails.totalCost : bookingDetails.advanceAmount}\n\nThank you for your trust! 🙏`;
    await sendSessionMessage(phone, message);
  } catch (error) {
    console.error("sendBookingPaymentNotification error:", error);
  }
}

export async function sendBookingReadyNotification(phone: string, bookingDetails: any) {
  try {
    const message = `*The Grove Restaurant* 🍽️\n\n✨ *Your event is ready!*\n\n📋 *Booking ID:* ${bookingDetails.bookingNumber}\n🎉 *Event:* ${bookingDetails.eventName}\n👥 *Guests:* ${bookingDetails.guestCount}\n\nOur team is excited to host you! 🌿`;
    await sendSessionMessage(phone, message);
  } catch (error) {
    console.error("sendBookingReadyNotification error:", error);
  }
}
