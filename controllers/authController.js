import { validationResult } from 'express-validator';
import User from '../models/User.js';
import argon2 from 'argon2';
import { generateToken } from '../utils/jwt.js';

/**
 * GET /api/auth
 * Returns the authenticated user's data (minus password).
 * @access Private
 */
export async function getAuthUser(req, res) {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
}

/**
 * POST /api/auth
 * Validates credentials and returns a signed JWT on success.
 * @access Public
 */
export async function loginUser(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ msg: 'Invalid Credentials' });

		const isPasswordValid = await argon2.verify(user.password, password);
		if (!isPasswordValid)
			return res.status(401).json({ msg: 'Invalid Credentials' });

		try {
			const token = await generateToken(user.id);
			return res.status(200).json({
				token,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					headline: user.headline,
					location: user.location,
					avatar: user.avatar,
				},
			});
		} catch (err) {
			console.error(err);
			return res.status(500).send('Server error');
		}
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server error');
	}
}
