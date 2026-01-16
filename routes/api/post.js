import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { check, validationResult } from 'express-validator';
import User from '../../models/User.js';
import Post from '../../models/Post.js';

const router = Router();

// @route   GET api/posts
// @desc    Get all posts (paginated)
// @access  Private
router.get('/', auth, async (req, res) => {
	try {
		// Parse pagination params with defaults and limits
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
		const skip = (page - 1) * limit;

		// Use Promise.all to run queries in parallel for better performance
		const [posts, totalPosts] = await Promise.all([
			Post.find()
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('user', ['name', 'avatar'])
				.lean(), // Use lean() for read-only data (faster)
			Post.countDocuments(),
		]);

		res.json({
			posts,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(totalPosts / limit),
				totalPosts,
				postsPerPage: limit,
				hasNextPage: page * limit < totalPosts,
				hasPrevPage: page > 1,
			},
		});
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

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// Check if user owns the post
		if (post.user.toString() !== req.user.id) {
			return res
				.status(401)
				.json({ msg: 'Not authorized to delete this post' });
		}

		await Post.findByIdAndDelete(req.params.id);
		res.json({ msg: 'Post deleted' });
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server error');
	}
});

// @route   PUT api/posts/:id/like
// @desc    Like a post
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// Check if user already liked the post
		if (post.likes.includes(req.user.id)) {
			return res.status(400).json({ msg: 'You have already liked this post' });
		}

		post.likes.unshift(req.user.id);
		await post.save();
		res.json(post.likes);
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server error');
	}
});

// @route   PUT api/posts/:id/unlike
// @desc    Unlike a post
// @access  Private
router.put('/:id/unlike', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// Check if user hasn't liked the post
		if (!post.likes.includes(req.user.id)) {
			return res.status(400).json({ msg: 'You have not liked this post' });
		}

		const removeIndex = post.likes.indexOf(req.user.id);
		post.likes.splice(removeIndex, 1);
		await post.save();
		res.json(post.likes);
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server error');
	}
});

// @route   POST api/posts/:id/comments
// @desc    Add a comment to a post
// @access  Private
router.post(
	'/:id/comments',
	[auth, [check('text', 'Comment text is required').not().isEmpty()]],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const user = await User.findById(req.user.id);
			const post = await Post.findById(req.params.id);

			if (!post) {
				return res.status(404).json({ msg: 'Post not found' });
			}

			const newComment = {
				text: req.body.text,
				name: user.name,
				avatar: user.avatar,
				user: req.user.id,
			};

			post.comments.unshift(newComment);
			await post.save();
			res.json(post.comments);
		} catch (error) {
			console.error(error.message);
			if (error.kind === 'ObjectId') {
				return res.status(404).json({ msg: 'Post not found' });
			}
			res.status(500).send('Server error');
		}
	}
);

// @route   DELETE api/posts/:id/comments/:comment_id
// @desc    Delete a comment from a post
// @access  Private
router.delete('/:id/comments/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		// Get the comment
		const comment = post.comments.find((c) => c.id === req.params.comment_id);
		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' });
		}

		// Check if user owns the comment
		if (comment.user.toString() !== req.user.id) {
			return res
				.status(401)
				.json({ msg: 'Not authorized to delete this comment' });
		}

		const removeIndex = post.comments
			.map((c) => c.id)
			.indexOf(req.params.comment_id);
		post.comments.splice(removeIndex, 1);
		await post.save();
		res.json(post.comments);
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server error');
	}
});

export default router;
