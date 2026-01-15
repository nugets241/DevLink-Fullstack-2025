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

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post(
	'/',
	[auth, [check('text', 'Text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id);
			if (!user) {
				return res.status(404).json({ msg: 'User not found' });
			}

			const newPost = new Post({
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			});

			const post = await newPost.save();
			res.json(post);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server error');
		}
	}
);

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id).populate('user', [
			'name',
			'avatar',
		]);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.json(post);
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server error');
	}
});

export default router;
