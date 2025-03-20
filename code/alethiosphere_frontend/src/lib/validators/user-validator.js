// src/lib/validators/user-validator.js
export const userValidator = {
	validate(data) {
		const errors = {};

		// Required fields
		if (!data.name) {
			errors.name = 'Name is required';
		}

		if (!data.email) {
			errors.email = 'Email is required';
		} else if (!isValidEmail(data.email)) {
			errors.email = 'Invalid email format';
		}

		if (!data.password && !data._id) {  // Password only required for new users
			errors.password = 'Password is required';
		} else if (data.password && data.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
		}

		return {
			valid: Object.keys(errors).length === 0,
			errors
		};
	},

	validatePartial(data) {
		const errors = {};

		// Validate fields only if they are present
		if (data.email !== undefined && !isValidEmail(data.email)) {
			errors.email = 'Invalid email format';
		}

		if (data.password !== undefined && data.password.length < 6) {
			errors.password = 'Password must be at least 6 characters';
		}

		return {
			valid: Object.keys(errors).length === 0,
			errors
		};
	}
};

function isValidEmail(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}