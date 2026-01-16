import jwt from 'jsonwebtoken';
import {
	JWT_SECRET,
	JWT_ISSUER,
	JWT_AUDIENCE,
	JWT_EXPIRES_IN,
} from './config.js';

/**
 * Generates a JWT for a given user ID.
 *
 * @param {string} userId - The user's ID to encode in the token
 * @returns {Promise<string>} - A promise that resolves to the signed JWT
 *
 * Why this exists:
 * - DRY (Don't Repeat Yourself): Prevents duplication of JWT signing logic
 * - Consistency: All JWTs use the same configuration
 * - Maintainability: Single place to update JWT logic
 * - Testability: Can be unit tested independently
 */
export const generateToken = (userId) => {
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured');
	}

	const payload = {
		user: { id: userId },
	};

	return new Promise((resolve, reject) => {
		jwt.sign(
			payload,
			JWT_SECRET,
			{
				expiresIn: JWT_EXPIRES_IN,
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			},
			(err, token) => {
				if (err) return reject(err);
				resolve(token);
			}
		);
	});
};
