// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findDocuments } from '@/lib/db';
import { generateToken } from '../server-jwt';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Validate inputs
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const users = await findDocuments('users', { email: email.toLowerCase() });
        const user = users[0];

        // Check if user exists
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Create JWT payload (don't include sensitive data)
        const tokenPayload = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user'
        };

        // Generate token
        const token = generateToken(tokenPayload);

        // Prepare user data for response (exclude sensitive fields)
        const userData = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || 'user'
        };

        // Create response with secure HttpOnly cookie
        const response = NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                user: userData
            },
            { status: 200 }
        );

        // Set HttpOnly cookie with the token
        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day in seconds
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);

        return NextResponse.json(
            { success: false, message: 'Login failed', error: error.message },
            { status: 500 }
        );
    }
}