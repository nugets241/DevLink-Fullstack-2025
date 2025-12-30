import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../../models/User.js';
import gravatar from 'gravatar';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } from '../../utils/config.js';

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
		.withMessage('Password must be at least 6 chars'),
];

// read config with safe defaults
const ARGON2_OPTIONS = {
	type: argon2.argon2id,
	timeCost: Number(process.env.ARGON2_TIME_COST) || 3,
	memoryCost: Number(process.env.ARGON2_MEMORY_COST) || 2 ** 16, // 65536 KiB = 64MB
	parallelism: Number(process.env.ARGON2_PARALLELISM) || 1,
};

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
			true
		);

		// Save user with hashed password
		const user = new User({ name, email, password: hashed, avatar });
		await user.save();

		const jwtSecret = JWT_SECRET;
		if (!jwtSecret)
			return res.status(500).json({ msg: 'JWT secret not configured' });

		const payload = { user: { id: user.id } };

		try {
			const token = await new Promise((resolve, reject) =>
				jwt.sign(
					payload,
					jwtSecret,
					{ expiresIn: '1h', issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
					(err, t) => (err ? reject(err) : resolve(t))
				)
			);
			return res.status(201).json({
				token,
				user: { id: user.id, name: user.name, email: user.email },
			});
		} catch (err) {
			console.error(err);
			return res.status(500).send('Server error');
		}

		// return res.status(201).json({ msg: 'User registered' });
	} catch (err) {
		console.error(err.message);
		return res.status(500).send('Server error');
	}
});

export default router;
