import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Post from '../models/Post.js';

const MAX_POST_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_POST_IMAGE_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
]);

// ─── Image helpers ───────────────────────────────────────────────────────────

export function parsePostImageDataUrl(imageDataUrl) {
	const match = imageDataUrl.match(
		/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/,
	);
	if (!match) {
		throw new Error('Image must be a valid base64 data URL');
	}

	const contentType = match[1].toLowerCase();
	if (!ALLOWED_POST_IMAGE_TYPES.has(contentType)) {
		throw new Error('Only JPEG, PNG, WEBP, or GIF images are supported');
	}

	const buffer = Buffer.from(match[2], 'base64');
	if (!buffer.length) {
		throw new Error('Image is empty');
	}

	if (buffer.length > MAX_POST_IMAGE_BYTES) {
		throw new Error('Image must be 5MB or smaller');
	}

	return { buffer, contentType };
}

export function getPostImageBuffer(rawImageData) {
	if (!rawImageData) return null;
	if (Buffer.isBuffer(rawImageData)) return rawImageData;
	if (Array.isArray(rawImageData)) return Buffer.from(rawImageData);
	if (rawImageData?.type === 'Buffer' && Array.isArray(rawImageData?.data))
		return Buffer.from(rawImageData.data);
	if (Array.isArray(rawImageData?.data)) return Buffer.from(rawImageData.data);
	if (rawImageData?._bsontype === 'Binary' && rawImageData?.buffer)
		return Buffer.from(rawImageData.buffer);
	if (rawImageData?.buffer) return Buffer.from(rawImageData.buffer);
	return null;
}

export function mapPostForClient(post) {
	const source = typeof post?.toObject === 'function' ? post.toObject() : post;
	if (!source) return source;

	let imageDataUrl;
	if (source.image?.data && source.image?.contentType) {
		const imageBuffer = getPostImageBuffer(source.image.data);
		if (imageBuffer && imageBuffer.length) {
			imageDataUrl = `data:${source.image.contentType};base64,${imageBuffer.toString('base64')}`;
		}
	}

	const { image, ...rest } = source;
	return { ...rest, imageDataUrl };
}

// ─── Route handlers ──────────────────────────────────────────────────────────

/**
 * GET /api/posts
 * Returns paginated posts, newest first.
 * @access Private
 */
export async function getPosts(req, res) {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
		const skip = (page - 1) * limit;

		const [posts, totalPosts] = await Promise.all([
			Post.find()
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate('user', ['name', 'avatar'])
				.lean(),
			Post.countDocuments(),
		]);

		res.json({
			posts: posts.map(mapPostForClient),
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
}

/**
 * POST /api/posts
 * Creates a new post (text and/or image).
 * @access Private
 */
export async function createPost(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ msg: 'User not found' });
		}

		const normalizedText = req.body.text?.trim() || undefined;
		const normalizedImageDataUrl = req.body.imageDataUrl?.trim() || '';
		let parsedImage;

		if (normalizedImageDataUrl) {
			try {
				parsedImage = parsePostImageDataUrl(normalizedImageDataUrl);
			} catch (parseError) {
				return res.status(400).json({
					errors: [{ msg: parseError.message, path: 'imageDataUrl' }],
				});
			}
		}

		const newPost = new Post({
			text: normalizedText,
			image:
				parsedImage && parsedImage.buffer.length
					? { data: parsedImage.buffer, contentType: parsedImage.contentType }
					: undefined,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id,
		});

		const post = await newPost.save();
		res.json(mapPostForClient(post));
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server error');
	}
}

/**
 * GET /api/posts/:id
 * Returns a single post by ID.
 * @access Private
 */
export async function getPostById(req, res) {
	try {
		const post = await Post.findById(req.params.id).populate('user', [
			'name',
			'avatar',
		]);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.json(mapPostForClient(post));
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server error');
	}
}

/**
 * DELETE /api/posts/:id
 * Deletes a post owned by the authenticated user.
 * @access Private
 */
export async function deletePost(req, res) {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

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
}

/**
 * PUT /api/posts/:id/like
 * Adds the authenticated user's like to a post.
 * @access Private
 */
export async function likePost(req, res) {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

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
}

/**
 * PUT /api/posts/:id/unlike
 * Removes the authenticated user's like from a post.
 * @access Private
 */
export async function unlikePost(req, res) {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		if (!post.likes.includes(req.user.id)) {
			return res.status(400).json({ msg: 'You have not liked this post' });
		}

		post.likes.splice(post.likes.indexOf(req.user.id), 1);
		await post.save();
		res.json(post.likes);
	} catch (error) {
		console.error(error.message);
		if (error.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Post not found' });
		}
		res.status(500).send('Server error');
	}
}

/**
 * POST /api/posts/:id/comments
 * Adds a comment to a post.
 * @access Private
 */
export async function addComment(req, res) {
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

		post.comments.unshift({
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id,
		});
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

/**
 * PATCH /api/posts/:id/comments/:comment_id
 * Updates a comment the authenticated user owns.
 * @access Private
 */
export async function updateComment(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const nextText = req.body.text.trim();
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		const comment = post.comments.find((c) => c.id === req.params.comment_id);
		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' });
		}

		if (comment.user.toString() !== req.user.id) {
			return res
				.status(401)
				.json({ msg: 'Not authorized to update this comment' });
		}

		if (comment.text !== nextText) {
			comment.text = nextText;
			comment.editedAt = new Date();
		}
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

/**
 * DELETE /api/posts/:id/comments/:comment_id
 * Removes a comment the authenticated user owns.
 * @access Private
 */
export async function deleteComment(req, res) {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		const comment = post.comments.find((c) => c.id === req.params.comment_id);
		if (!comment) {
			return res.status(404).json({ msg: 'Comment not found' });
		}

		if (comment.user.toString() !== req.user.id) {
			return res
				.status(401)
				.json({ msg: 'Not authorized to delete this comment' });
		}

		post.comments.splice(
			post.comments.map((c) => c.id).indexOf(req.params.comment_id),
			1,
		);
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
