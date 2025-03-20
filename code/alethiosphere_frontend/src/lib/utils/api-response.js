// src/lib/utils/api-response.js
import { NextResponse } from 'next/server';

export function successResponse(data, status = 200, message = 'Success') {
	return NextResponse.json(
		{
			success: true,
			message,
			...data
		},
		{ status }
	);
}

export function errorResponse(message, status = 400, details = null) {
	const response = {
		success: false,
		message
	};

	if (details && process.env.NODE_ENV !== 'production') {
		response.details = details;
	}

	return NextResponse.json(response, { status });
}

export function validationErrorResponse(errors) {
	return NextResponse.json(
		{
			success: false,
			message: 'Validation failed',
			errors
		},
		{ status: 400 }
	);
}

export function notFoundResponse(resource = 'Resource') {
	return NextResponse.json(
		{
			success: false,
			message: `${resource} not found`
		},
		{ status: 404 }
	);
}

export function paginatedResponse(data, pagination) {
	return NextResponse.json(
		{
			success: true,
			data,
			pagination
		},
		{ status: 200 }
	);
}