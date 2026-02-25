import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../../models/User.js';
import gravatar from 'gravatar';
import argon2 from 'argon2';
import { ARGON2_OPTIONS } from '../../utils/config.js';
import { generateToken } from '../../utils/jwt.js';
import auth from '../../middleware/auth.js';

const router = Router();

function serializeUser(user) {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		headline: user.headline,
		location: user.location,
		avatar: user.avatar,
	};
}

const registerValidators = [
	body('name').trim().notEmpty().withMessage('Name required'),
	body('email')
		.trim()
		.isEmail()
		.withMessage('Valid email required')
		.normalizeEmail(),
	body('password')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters'),
];

const updateMeValidators = [
	auth,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Name cannot be empty')
		.isLength({ max: 80 })
		.withMessage('Name must be at most 80 characters'),
	body('headline')
		.optional()
		.trim()
		.isLength({ max: 120 })
		.withMessage('Headline must be at most 120 characters'),
	body('location')
		.optional()
		.trim()
		.isLength({ max: 120 })
		.withMessage('Location must be at most 120 characters'),
];

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', registerValidators, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { name, email, password } = req.body;

	try {
		// Check if user exists
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ msg: 'Email already in use' });

		// Hash password
		const hashed = await argon2.hash(password, ARGON2_OPTIONS);

		// Get user gravatar
		const avatar = gravatar.url(
			email,
			{ s: '200', r: 'pg', d: 'identicon' },
			true,
		);

		// Save user with hashed password
		const user = new User({
			name,
			email,
			password: hashed,
			avatar,
		});
		await user.save();

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
});

// @route   PUT api/users/me
// @desc    Update current user basic profile fields
// @access  Private
router.put('/me', updateMeValidators, async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const updates = {};
	if (typeof req.body.name === 'string') {
		updates.name = req.body.name.trim();
	}
	if (typeof req.body.headline === 'string') {
		updates.headline = req.body.headline.trim();
	}
	if (typeof req.body.location === 'string') {
		updates.location = req.body.location.trim();
	}

	if (Object.keys(updates).length === 0) {
		return res.status(400).json({
			msg: 'Provide at least one field to update: name, headline, or location.',
		});
	}

	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ msg: 'User not found' });
		}

		Object.assign(user, updates);
		await user.save();

		return res.json(serializeUser(user));
	} catch (err) {
		if (err.name === 'ValidationError') {
			return res.status(400).json({ msg: err.message });
		}
		console.error(err.message);
		return res.status(500).send('Server error');
	}
});

export default router;
