# Session Management & User Authentication System

## Overview

A comprehensive session management system has been implemented to solve the multi-user cart and order data corruption issues. This system ensures that:

1. **User Sessions are Tracked** - Each user is assigned a unique JWT token after OTP verification
2. **Carts are User-Specific** - Each user has their own isolated cart in localStorage
3. **Orders are Tied to Users** - All orders are automatically associated with the authenticated user
4. **Multi-User Support** - Multiple users can safely use the app on the same device without data interference

## Architecture

### Components

#### 1. Authentication Library (`src/lib/auth.js`)
- **`generateToken(phone)`** - Creates a JWT token for a user
- **`verifyToken(token)`** - Validates and decodes a JWT token
- **`extractUserFromRequest(request)`** - Extracts user info from API request headers/cookies
- **`getTokenFromRequest(request)`** - Retrieves token from Authorization header or cookies

#### 2. Authentication API Routes

##### `/api/auth/send-otp` (POST)
- Sends OTP to user's phone
- Returns dummy OTP for development
- **Response**: `{ success, otp, expiresIn }`

##### `/api/auth/verify-otp` (POST)
- Verifies OTP code
- **Auto-creates customer** if first-time user
- **Generates JWT token** valid for 7 days
- Sets `userToken` cookie (HTTP-only, secure)
- **Request**: `{ phone, otp }`
- **Response**: `{ success, token, customerId, customer }`

##### `/api/auth/me` (GET)
- Returns current authenticated user info
- **Requires**: Valid authentication token
- **Response**: `{ success, user: { phone, name, planType, customerId } }`

##### `/api/auth/logout` (POST)
- Clears user session and cookies
- Removes user-specific data from localStorage
- **Response**: `{ success, message }`

#### 3. Auth Context (`src/hooks/useAuth.js`)
Client-side authentication state management:

```javascript
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout, loading, error } = useAuth();

  // user: { phone, name, planType, customerId }
  // isAuthenticated: boolean
  // login(phone, otp): Promise<{ success, ... }>
  // logout(): Promise<{ success }>
}
```

#### 4. User-Specific Cart (`src/hooks/useCart.js`)
Cart now isolated per user:

```javascript
// Storage key format:
// Authenticated: "grove_cart_{userPhone}"
// Guest: "grove_cart_guest_session"

// Cart automatically:
// - Loads when user logs in
// - Clears when user logs out
// - Persists across page refreshes
```

### Updated API Security

#### `/api/orders` (GET/POST)
- **Now requires authentication**
- Automatically filters orders by authenticated user's phone
- Cannot access other users' orders
- Phone number auto-populated from token (not from request)

**GET Request**:
```javascript
fetch('/api/orders?page=1&limit=20', {
  credentials: 'include' // Include cookies!
})
```

**POST Request** (Create Order):
```javascript
fetch('/api/orders', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [{ _id, name, price, quantity }],
    totalPrice: 450,
    // NO need to provide phone - auto-populated!
    customerInfo: {
      name: 'Optional name override',
      email: 'optional@email.com'
    }
  })
})
```

## Usage Flow

### 1. User Authentication
```javascript
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (phone, otp) => {
    const result = await login(phone, otp);
    if (result.success) {
      // User logged in, cart isolated, ready to order
    }
  };
}
```

### 2. Cart Management (After Login)
```javascript
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export default function Menu() {
  const { user } = useAuth();
  const { addToCart, items } = useCart();

  // Cart is user-specific
  // Only current logged-in user sees their items
}
```

### 3. Place Order (After Login)
```javascript
const response = await fetch('/api/orders', {
  method: 'POST',
  credentials: 'include', // Critical!
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems,
    totalPrice: totalAmount,
    paymentMethod: 'Cash'
  })
});

// Order automatically associated with user!
```

### 4. Logout
```javascript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // Cart cleared automatically
  // User data removed
  // Ready for next user
};
```

## Key Changes from Previous System

### Before (Broken)
```
❌ All users share same localStorage: "grove_cart"
❌ Cart persists for ALL users on device
❌ No way to identify which user placed order
❌ Multiple users' orders/carts mix together
❌ Page refresh didn't validate user session
```

### After (Fixed)
```
✅ Each user has unique localStorage key: "grove_cart_{phone}"
✅ Cart is automatically cleared on logout
✅ All orders tied to authenticated user's phone
✅ Complete user isolation on same device
✅ Session validated on app startup
✅ Automatic re-login on token expiry (optional)
✅ HTTP-only cookies prevent XSS attacks
```

## Migration Checklist

- [ ] `src/lib/auth.js` created ✅
- [ ] `src/hooks/useAuth.js` created ✅
- [ ] `src/app/api/auth/verify-otp/route.js` updated ✅
- [ ] `src/app/api/auth/me/route.js` created ✅
- [ ] `src/app/api/auth/logout/route.js` created ✅
- [ ] `src/hooks/useCart.js` updated ✅
- [ ] `src/app/api/orders/route.js` updated (requires auth) ✅
- [ ] `src/app/layout.js` updated (AuthProvider added) ✅
- [ ] `jsonwebtoken` & `jose` installed ✅

## Environment Setup

Add to `.env.local`:
```
JWT_SECRET=your-super-secret-key-min-32-chars-change-in-production
```

## Security Notes

1. **HTTP-Only Cookies**: Tokens stored in HTTP-only cookies, not accessible via JavaScript (prevents XSS)
2. **Token Expiry**: JWT tokens expire after 7 days
3. **CORS**: Ensure `credentials: 'include'` in all fetch requests
4. **Phone as ID**: User phone is primary identifier (must be unique)

## Testing Multi-User Scenario

1. **User A**: Logs in with phone `9876543210`
   - Adds items to cart
   - Cart stored as `grove_cart_9876543210`

2. **User A**: Page refresh
   - Cart persists (user still logged in)

3. **User A**: Logs out
   - Cart cleared automatically
   - Token cookie removed

4. **User B**: Logs in with phone `9123456789`
   - New cart key: `grove_cart_9123456789`
   - Cannot see User A's cart or orders
   - Places order - shows User B's phone

5. **Verify**: Both users can see only their own orders via `/api/orders`

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/send-otp` | POST | ❌ | Request OTP |
| `/api/auth/verify-otp` | POST | ❌ | Verify OTP, get token |
| `/api/auth/me` | GET | ✅ | Get current user |
| `/api/auth/logout` | POST | ✅ | Clear session |
| `/api/orders` | GET | ✅ | Get user's orders |
| `/api/orders` | POST | ✅ | Create order |

## Troubleshooting

**Cart not persisting after login?**
- Check if `AuthProvider` is in `layout.js`
- Verify `localStorage.getItem('grove_cart_userphone')`

**Order with wrong phone?**
- Ensure `credentials: 'include'` in fetch
- Check if JWT token is valid: `GET /api/auth/me`

**Multiple users sharing cart?**
- Clear browser storage: `localStorage.clear()`
- Check browser cookies for `userToken`
- Ensure proper logout flow

**Token expired?**
- User must login again
- Token expires after 7 days
- Extend by modifying `JWT_EXPIRY` in `src/lib/auth.js`
