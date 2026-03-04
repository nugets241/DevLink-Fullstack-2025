import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../../models/User.js';
import Profile from '../../models/Profile.js';
import gravatar from 'gravatar';
import argon2 from 'argon2';
import { ARGON2_OPTIONS } from '../../utils/config.js';
import { generateToken } from '../../utils/jwt.js';
import auth from '../../middleware/auth.js';

const router = Router();

function normalizeSpacing(value) {
	if (typeof value !== 'string') return value;
	return value.trim().replace(/\s+/g, ' ');
}

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
	const normalizedName = normalizeSpacing(name);

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
});

// @route   PUT api/users/me
// @desc    Update current user basic profile fields
// @access  Private
router.patch('/me', updateMeValidators, async (req, res) => {
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
});

export default router;
