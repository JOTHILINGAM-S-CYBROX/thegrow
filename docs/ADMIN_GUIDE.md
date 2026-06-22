# Admin Panel & Security Guide

## ⚠️ SECURITY ALERT

**Current State:** Admin pages have NO authentication. Anyone can access:
- `/admin/orders`
- `/admin/venue-bookings`

**BEFORE PRODUCTION:** Implement authentication immediately!

---

## Admin Dashboard Access

### Current Access
```
URL: http://localhost:3000/admin/orders
URL: http://localhost:3000/admin/venue-bookings
Authentication: ⛔ NONE (OPEN TO PUBLIC)
```

### Pages Available
1. **Incoming Orders** (`/admin/orders`)
   - View incoming orders
   - Update order status (Pending → Preparing → Ready → Completed)
   - Order tracking

2. **Venue Bookings** (`/admin/venue-bookings`)
   - Manage event/venue bookings
   - Booking status management

---

## Database Models

### Menu Model

**File:** `src/models/Menu.js`

```javascript
{
  _id: ObjectId,                // Unique identifier
  name: String,                 // Item name
  description: String,          // Item description
  price: Number,                // Price in rupees
  category: String,             // Category (Main, Appetizer, etc.)
  imageUrl: String,             // Image URL
  createdAt: Date,              // Creation timestamp
  updatedAt: Date               // Last update timestamp
}
```

**Example Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Kerala Chicken",
  "description": "Slow-roasted with hand-ground spices",
  "price": 850,
  "category": "Main Course",
  "imageUrl": "https://example.com/kerala-chicken.jpg",
  "createdAt": "2024-03-01T10:00:00Z",
  "updatedAt": "2024-03-01T10:00:00Z"
}
```

### Order Model (To Be Created)

```javascript
{
  _id: ObjectId,
  orderNumber: String,          // e.g., "#10492"
  items: [{
    menuItemId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalPrice: Number,
  status: String,               // "Pending", "Preparing", "Ready", "Completed"
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  orderTime: Date,
  completedAt: Date,
  notes: String
}
```

### VenueBooking Model (To Be Created)

```javascript
{
  _id: ObjectId,
  bookingNumber: String,
  eventName: String,
  guestCount: Number,
  date: Date,
  timeSlot: String,             // e.g., "6:00 PM - 10:00 PM"
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  specialRequests: String,
  status: String,               // "Pending", "Confirmed", "Completed", "Cancelled"
  totalPrice: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Database Connection

**File:** `src/lib/db.js`

```javascript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  
  // Connection logic...
  console.log('✅ Successfully connected to MongoDB!');
  return cached.conn;
}
```

**Configuration:**
- Provider: MongoDB Atlas
- URI: Set in `.env.local` as `MONGODB_URI`
- Connection Pooling: Enabled by default

---

## Creating Models

### Step 1: Create Model File

```javascript
// src/models/Order.js
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    menuItemId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    price: Number
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Preparing', 'Ready', 'Completed'],
    default: 'Pending'
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
```

### Step 2: Use in API Routes

```javascript
import Order from '@/models/Order';

export async function GET() {
  await dbConnect();
  const orders = await Order.find({});
  return NextResponse.json(orders);
}
```

---

## Implementing Authentication

### Option 1: Session-Based (Recommended)

```bash
npm install next-auth@beta bcryptjs
```

### Option 2: JWT-Based

```bash
npm install jsonwebtoken
```

### Option 3: Simple Password Protection

```javascript
// src/lib/auth.js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function verifyAdminLogin(password) {
  return password === ADMIN_PASSWORD;
}
```

Create a simple login page:

```javascript
// src/app/(admin)/login/page.js
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (response.ok) {
      localStorage.setItem('adminToken', 'authenticated');
      router.push('/admin/orders');
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full px-4 py-2 border border-stone-300 rounded mb-4"
          required
        />
        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded hover:opacity-90"
        >
          Login
        </button>
      </form>
    </div>
  );
}
```

Create API endpoint:

```javascript
// src/app/api/admin/login/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (password === adminPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('adminToken', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    return response;
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
```

Update `.env.local`:

```env
ADMIN_PASSWORD=your_secure_password_here
```

**⚠️ CHANGE THIS IMMEDIATELY after setup!**

---

## Middleware Protection (Recommended)

```javascript
// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('adminToken');
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
```

---

## Best Practices

### ✅ DO

- Use strong, unique admin passwords
- Implement HTTPS in production
- Use secure cookies (httpOnly, secure)
- Log admin activities
- Add rate limiting on login attempts
- Regular security audits
- Update dependencies frequently

### ❌ DON'T

- Store passwords in plaintext
- Commit `.env.local` to git
- Use same password everywhere
- Expose sensitive data in logs
- Trust client-side authentication only
- Skip HTTPS in production

---

## Environment Variables

**Required:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

**Recommended (add after auth setup):**
```env
ADMIN_PASSWORD=SecurePassword123!
NEXTAUTH_SECRET=random_string_here
NEXTAUTH_URL=http://localhost:3000
```

---

## Monitoring

### Check Admin Access Log

Add to your routes:

```javascript
import { adminLogger } from '@/lib/logger';

export async function GET(request) {
  // Log admin access
  adminLogger.info(`Admin accessed orders`, {
    ip: request.ip,
    timestamp: new Date()
  });
  
  // Handler...
}
```

---

## TODO: Pre-Production Checklist

- [ ] Implement authentication system
- [ ] Add login page at `/admin/login`
- [ ] Create Order model
- [ ] Create VenueBooking model
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Enable HTTPS
- [ ] Add audit logging
- [ ] Test all authentication flows
- [ ] Review security headers
- [ ] Set up rate limiting

---

## Helpful Resources

- [Next.js Auth Documentation](https://next-auth.js.org/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [OWASP Security Best Practices](https://owasp.org/)

---

For quick setup questions, see [GETTING_STARTED.md](../GETTING_STARTED.md)
For API documentation, see [API_ROUTES.md](API_ROUTES.md)
