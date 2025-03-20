// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
	// Create response
	const response = NextResponse.json(
		{
			success: true,
			message: 'Logout successful'
		},
		{ status: 200 }
	);

	// Clear the auth cookie
	response.cookies.set({
		name: 'auth_token',
		value: '',
		httpOnly: true,
		expires: new Date(0), // Expire immediately
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		path: '/'
	});

	return response;
}