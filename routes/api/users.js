import { Router } from 'express';
import { body } from 'express-validator';
import auth from '../../middleware/auth.js';
import { registerUser, updateMe } from '../../controllers/usersController.js';

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

// @route   POST  api/users      – register
// @route   PATCH api/users/me   – update own basics
router.post('/', registerValidators, registerUser);
router.patch('/me', updateMeValidators, updateMe);

export default router;
