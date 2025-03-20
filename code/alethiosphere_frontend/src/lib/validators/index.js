// src/lib/validators/index.js
import { userValidator } from './user-validator';
import { postValidator } from './post-validator';
// Import other validators as needed

const validators = {
	users: userValidator,
	posts: postValidator,
	// Add more validators for other resources
};

export function getResourceValidator(resource) {
	return validators[resource] || null;
}