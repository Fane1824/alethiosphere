import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // 1 day default
const JWT_ISSUER = process.env.JWT_ISSUER || 'alethiosphere-api';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'alethiosphere-client';

// Verify environment variables on startup
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Generate a JWT token
 * @param {Object} payload - Data to include in the token
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithm: 'HS256'
      }
  );
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
  if (typeof token !== 'string' || !token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256']
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);

    // Return specific information for different error types
    if (error.name === 'TokenExpiredError') {
      return { expired: true, message: 'Token has expired' };
    }

    if (error.name === 'JsonWebTokenError') {
      return { invalid: true, message: 'Invalid token' };
    }

    return null;
  }
}

/**
 * Extract JWT token from Authorization header
 * @param {Request} request - Next.js Request object
 * @returns {string|null} Token or null if not found
 */
export function extractTokenFromHeader(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
}

/**
 * Extract JWT token from cookies
 * @param {Object} cookies - Cookies object from Next.js
 * @returns {string|null} Token or null if not found
 */
export function extractTokenFromCookies(cookies) {
  const token = cookies.get('auth_token')?.value;
  return token || null;
}

/**
 * Authentication middleware
 * @param {Function} handler - API route handler
 * @returns {Function} Middleware-wrapped handler
 */
export function withAuth(handler) {
  return async (request) => {
    // Try to get token from Authorization header first
    let token = extractTokenFromHeader(request);

    // If no token in header, try cookies
    if (!token) {
      // Get cookies from request
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        // Parse cookies manually if needed
        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => {
              const [name, ...value] = c.split('=');
              return [name, value.join('=')];
            })
        );
        token = cookies.auth_token;
      }
    }

    if (!token) {
      return NextResponse.json(
          {
            success: false,
            message: 'Authentication required'
          },
          { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
          {
            success: false,
            message: 'Invalid authentication token'
          },
          { status: 401 }
      );
    }

    if (decoded.expired) {
      return NextResponse.json(
          {
            success: false,
            message: 'Authentication token has expired',
            expired: true
          },
          { status: 401 }
      );
    }

    // Add user info to the request
    request.user = decoded;

    // Call the original handler
    return handler(request);
  };
}

/**
 * Role-based authorization middleware
 * @param {Function} handler - API route handler
 * @param {Array<string>} allowedRoles - Roles allowed to access this route
 * @returns {Function} Middleware-wrapped handler
 */
export function withRoles(handler, allowedRoles = []) {
  return withAuth(async (request) => {
    const user = request.user;

    // If no roles are specified, proceed
    if (!allowedRoles.length) {
      return handler(request);
    }

    // Check if user has an allowed role
    if (!user.role || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
          {
            success: false,
            message: 'You do not have permission to access this resource'
          },
          { status: 403 }
      );
    }

    // User has an allowed role, proceed
    return handler(request);
  });
}