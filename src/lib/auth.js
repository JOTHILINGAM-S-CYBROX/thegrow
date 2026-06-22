/**
 * Authentication utilities for managing user sessions
 * Handles JWT tokens and user identification
 */

import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

/**
 * Generate JWT token for user
 */
export function generateToken(phone) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  return jwt.sign(
    { phone, iat: Date.now() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Extract phone number from token
 */
export function getPhoneFromToken(token) {
  const decoded = verifyToken(token);
  return decoded ? decoded.phone : null;
}

/**
 * Get token from request headers or cookies
 */
export function getTokenFromRequest(request) {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const tokens = cookie.split(';').map(c => c.trim());
    const userTokenCookie = tokens.find(c => c.startsWith('userToken='));
    if (userTokenCookie) {
      return userTokenCookie.split('=')[1];
    }
  }

  return null;
}

/**
 * Extract user from request (for API routes)
 */
export function extractUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  return decoded ? { phone: decoded.phone } : null;
}
