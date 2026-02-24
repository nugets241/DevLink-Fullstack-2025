import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../../models/User.js';
import gravatar from 'gravatar';
import argon2 from 'argon2';
import { ARGON2_OPTIONS } from '../../utils/config.js';
import { generateToken } from '../../utils/jwt.js';

const router = Router();

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
		const user = new User({ name, email, password: hashed, avatar });
		await user.save();

		try {
			const token = await generateToken(user.id);
			return res.status(201).json({
				token,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
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
});

export default router;
