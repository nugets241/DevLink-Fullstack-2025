import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { body, check } from 'express-validator';
import {
	getPosts,
	createPost,
	getPostById,
	deletePost,
	likePost,
	unlikePost,
	addComment,
	updateComment,
	deleteComment,
} from '../../controllers/postController.js';

const router = Router();

// ─── Validators ──────────────────────────────────────────────────────────────

const createPostValidators = [
	body('text')
		.optional({ checkFalsy: true })
		.isString()
		.withMessage('Text must be a string'),
	body('imageDataUrl')
		.optional({ checkFalsy: true })
		.isString()
		.withMessage('Image data is invalid'),
	body().custom((payload) => {
		const normalizedText = payload?.text?.trim?.() ?? '';
		const normalizedImageDataUrl = payload?.imageDataUrl?.trim?.() ?? '';
		if (!normalizedText && !normalizedImageDataUrl) {
			throw new Error('Post text or image is required');
		}
		return true;
	}),
];

const commentValidators = [
	check('text', 'Comment text is required').not().isEmpty(),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

router.get('/', auth, getPosts);
router.post('/', [auth, createPostValidators], createPost);
router.get('/:id', auth, getPostById);
router.delete('/:id', auth, deletePost);
router.put('/:id/like', auth, likePost);
router.put('/:id/unlike', auth, unlikePost);
router.post('/:id/comments', [auth, commentValidators], addComment);
router.patch(
	'/:id/comments/:comment_id',
	[auth, commentValidators],
	updateComment,
);
router.delete('/:id/comments/:comment_id', auth, deleteComment);

export default router;
