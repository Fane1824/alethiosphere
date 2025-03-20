// src/app/api/users/register/route.js
import bcrypt from 'bcryptjs';
import { findDocuments, insertDocument } from '@/lib/db';
import {
  successResponse,
  errorResponse,
  validationErrorResponse
} from '@/lib/utils/api-response';

export async function POST(request) {
  try {
    const userData = await request.json();

    // Validate required fields
    const errors = {};

    if (!userData.name || !userData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!userData.email || !userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!userData.password) {
      errors.password = 'Password is required';
    } else if (userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors);
    }

    // Check if user with this email already exists
    const existingUsers = await findDocuments('users', { email: userData.email.toLowerCase() });
    if (existingUsers.length > 0) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Prepare user data for storage
    const userToSave = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user', // Default role
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create the user
    const newUser = await insertDocument('users', userToSave);

    // Remove password from response
    const { password, ...userResponse } = newUser;

    return successResponse({
      user: userResponse
    }, 201, 'User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    return errorResponse('Failed to register user', 500, error.message);
  }
}