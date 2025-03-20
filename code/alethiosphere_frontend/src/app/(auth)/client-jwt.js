/**
 * Secure API call function with JWT authentication
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export async function apiCall(endpoint, options = {}) {
	try {
		// Set up headers with content type
		const headers = {
			'Content-Type': 'application/json',
			...options.headers,
		};

		// Build the request
		const fetchOptions = {
			...options,
			headers,
			credentials: 'include', // Include cookies in the request
		};

		// Make the fetch call
		const response = await fetch(endpoint, fetchOptions);

		// Extract response data
		let data;
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			data = await response.json();
		} else {
			data = await response.text();
		}

		// Handle authentication errors
		if (response.status === 401) {
			// Check if token is expired
			const isExpired = data.expired === true;

			// Clear auth state
			removeAuthData();

			// Trigger auth event
			const authEvent = new CustomEvent('auth:required', {
				detail: {
					expired: isExpired,
					message: data.message || 'Authentication required'
				}
			});
			window.dispatchEvent(authEvent);

			// Redirect to login with appropriate message
			const redirectUrl = `/login?${isExpired ? 'session_expired=true' : 'auth_required=true'}`;

			// Use Next.js router if available, otherwise window.location
			if (typeof window !== 'undefined') {
				if (window.location.pathname !== '/login') {
					window.location.href = redirectUrl;
				}
			}

			throw new Error(data.message || 'Authentication required');
		}

		// Handle other errors
		if (!response.ok) {
			throw new Error(
				typeof data === 'object' && data.message
					? data.message
					: `API request failed with status ${response.status}`
			);
		}

		return data;
	} catch (error) {
		console.error('API call error:', error);
		throw error;
	}
}

/**
 * Store authentication data securely
 * @param {Object} data - Authentication data with token and user info
 */
export function storeAuthData(data) {
	// Store user data in sessionStorage (less vulnerable than localStorage)
	if (data.user) {
		try {
			sessionStorage.setItem('user', JSON.stringify(data.user));
		} catch (e) {
			console.error('Failed to store user data:', e);
		}
	}

	// Note: The JWT token is stored in an HttpOnly cookie by the server
	// We don't need to handle it on the client

	// Dispatch login event
	if (typeof window !== 'undefined') {
		const authEvent = new CustomEvent('auth:login', {
			detail: { user: data.user }
		});
		window.dispatchEvent(authEvent);
	}
}

/**
 * Remove authentication data on logout or error
 */
export function removeAuthData() {
	try {
		sessionStorage.removeItem('user');
	} catch (e) {
		console.error('Failed to remove user data:', e);
	}

	// Dispatch logout event
	if (typeof window !== 'undefined') {
		const authEvent = new CustomEvent('auth:logout');
		window.dispatchEvent(authEvent);
	}
}

/**
 * Get current user data
 * @returns {Object|null} User data or null if not authenticated
 */
export function getCurrentUser() {
	try {
		const userData = sessionStorage.getItem('user');
		return userData ? JSON.parse(userData) : null;
	} catch (e) {
		console.error('Failed to get user data:', e);
		return null;
	}
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
	return getCurrentUser() !== null;
}

/**
 * Login API call
 * @param {Object} credentials - User credentials
 * @returns {Promise<Object>} Authentication result
 */
export async function login(credentials) {
	const data = await apiCall('/api/auth/login', {
		method: 'POST',
		body: JSON.stringify(credentials),
	});

	if (data.success && data.user) {
		storeAuthData(data);
	}

	return data;
}

/**
 * Register a new user
 * @param {Object} userData - User registration data (name, email, password)
 * @returns {Promise<Object>} Registration result
 */
export async function register(userData) {
	try {
		// Call registration API endpoint
		const response = await fetch('/api/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(userData),
		});

		// Parse response data
		let data;
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			data = await response.json();
		} else {
			data = await response.text();
			return { success: false, message: data };
		}

		// Handle different response cases
		if (!response.ok) {
			// Check if this is a validation error with specific fields
			if (data.errors) {
				return {
					success: false,
					message: 'Validation failed',
					errors: data.errors
				};
			}

			// Check if user already exists
			if (response.status === 409) {
				return {
					success: false,
					message: 'User with this email already exists',
					userExists: true
				};
			}

			// Generic error
			return {
				success: false,
				message: data.message || 'Registration failed'
			};
		}

		// Return success with user data
		return {
			success: true,
			message: data.message || 'Registration successful',
			user: data.user
		};
	} catch (error) {
		console.error('Registration error:', error);
		return {
			success: false,
			message: 'Error connecting to registration service',
			error: error.message
		};
	}
}

/**
 * Logout API call
 * @returns {Promise<Object>} Logout result
 */
export async function logout() {
	try {
		await apiCall('/api/auth/logout', {
			method: 'POST',
		});
	} catch (error) {
		console.error('Logout error:', error);
	} finally {
		removeAuthData();
	}
}