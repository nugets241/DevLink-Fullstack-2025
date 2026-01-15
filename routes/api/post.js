import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { check, validationResult } from 'express-validator';
import User from '../../models/User.js';
import Post from '../../models/Post.js';

const router = Router();

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate('user', ['name', 'avatar']);
		res.json(posts);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
});

export default router;
