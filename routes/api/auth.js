import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { body } from 'express-validator';
import { getAuthUser, loginUser } from '../../controllers/authController.js';

const router = Router();

const loginValidators = [
	body('email')
		.trim()
		.isEmail()
		.withMessage('Valid email required')
		.normalizeEmail(),
	body('password').notEmpty().withMessage('Password is required'),
];

// @route   GET  api/auth       – get current user
// @route   POST api/auth       – login
router.get('/', auth, getAuthUser);
router.post('/', loginValidators, loginUser);

export default router;
