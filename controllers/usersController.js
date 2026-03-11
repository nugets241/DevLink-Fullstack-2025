import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import gravatar from 'gravatar';
import argon2 from 'argon2';
import { ARGON2_OPTIONS } from '../utils/config.js';
import { generateToken } from '../utils/jwt.js';

function normalizeSpacing(value) {
	if (typeof value !== 'string') return value;
	return value.trim().replace(/\s+/g, ' ');
}

export function serializeUser(user) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		headline: user.headline,
		location: user.location,
		avatar: user.avatar,
	};
}

/**
 * POST /api/users
 * Registers a new user, creates a default profile, and returns a JWT.
 * @access Public
 */
export async function registerUser(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { name, email, password } = req.body;
	const normalizedName = normalizeSpacing(name);

	try {
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ msg: 'Email already in use' });

		const hashed = await argon2.hash(password, ARGON2_OPTIONS);

		const avatar = gravatar.url(
			email,
			{ s: '200', r: 'pg', d: 'identicon' },
			true,
		);

		const user = new User({
			name: normalizedName,
			email,
			password: hashed,
			avatar,
		});
		await user.save();

		await Profile.create({
			user: user.id,
			skills: [],
			experience: [],
			education: [],
		});

		try {
			const token = await generateToken(user.id);
			return res.status(201).json({
				token,
				user: serializeUser(user),
			});
		} catch (err) {
			console.error(err);
			return res.status(500).send('Server error');
		}
	} catch (err) {
		if (err.name === 'ValidationError') {
			return res.status(400).json({ msg: err.message });
		}
		console.error(err.message);
		return res.status(500).send('Server error');
	}
}

/**
 * PATCH /api/users/me
 * Updates the authenticated user's basic info fields.
 * @access Private
 */
export async function updateMe(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const updates = {
		name: normalizeSpacing(req.body.name),
		headline: normalizeSpacing(req.body.headline),
		location: normalizeSpacing(req.body.location),
	};

	try {
		const user = await User.findByIdAndUpdate(
			req.user.id,
			{ $set: updates },
			{ new: true, runValidators: true },
		);

		if (!user) {
			return res.status(404).json({ msg: 'User not found' });
		}

		return res.json(serializeUser(user));
	} catch (err) {
		if (err.name === 'ValidationError') {
			return res.status(400).json({ msg: err.message });
		}
		console.error(err.message);
		return res.status(500).send('Server error');
	}
}
