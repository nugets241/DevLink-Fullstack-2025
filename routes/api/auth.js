import { Router } from 'express';
import auth from '../../middleware/auth.js';
const router = Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, (_req, res) => res.send('Auth route'));

export default router;
