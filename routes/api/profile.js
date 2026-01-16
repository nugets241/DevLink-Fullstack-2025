import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { check, validationResult } from 'express-validator';
import Profile from '../../models/Profile.js';
import User from '../../models/User.js';
import Post from '../../models/Post.js';

const router = Router();

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			'user',
			['name', 'avatar']
		);
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post(
	'/',
	[
		auth,
		[
			check('status', 'Status is required').not().isEmpty(),
			check('skills', 'Skills is required').not().isEmpty(),
			// URL validation: prevents XSS, invalid URLs, and non-http(s) protocols
			check('website')
				.optional({ checkFalsy: true })
				.isURL({ protocols: ['http', 'https'], require_protocol: true })
				.withMessage('Website must be a valid HTTP/HTTPS URL'),
			check('social.linkedin')
				.optional({ checkFalsy: true })
				.isURL({ protocols: ['http', 'https'], require_protocol: true })
				.withMessage('LinkedIn must be a valid HTTP/HTTPS URL'),
			check('social.github')
				.optional({ checkFalsy: true })
				.isURL({ protocols: ['http', 'https'], require_protocol: true })
				.withMessage('GitHub must be a valid HTTP/HTTPS URL'),
			check('social.x')
				.optional({ checkFalsy: true })
				.isURL({ protocols: ['http', 'https'], require_protocol: true })
				.withMessage('X must be a valid HTTP/HTTPS URL'),
			check('social.facebook')
				.optional({ checkFalsy: true })
				.isURL({ protocols: ['http', 'https'], require_protocol: true })
				.withMessage('Facebook must be a valid HTTP/HTTPS URL'),
			check('social.youtube')
				.optional({ checkFalsy: true })
				.isURL({ protocols: ['http', 'https'], require_protocol: true })
				.withMessage('YouTube must be a valid HTTP/HTTPS URL'),
			check('social.instagram')
				.optional({ checkFalsy: true })
				.isURL({ protocols: ['http', 'https'], require_protocol: true })
				.withMessage('Instagram must be a valid HTTP/HTTPS URL'),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			skills,
			social,
			experience,
			education,
		} = req.body;

		try {
			// Build profile object
			const profileFields = {
				user: req.user.id,
				company,
				website,
				location,
				bio,
				status,
				skills: Array.isArray(skills)
					? skills
					: skills.split(',').map((skill) => skill.trim()),
				social,
				experience,
				education,
			};

			// Find profile and update or create
			let profile = await Profile.findOneAndUpdate(
				{ user: req.user.id },
				{ $set: profileFields },
				{ new: true, upsert: true, setDefaultsOnInsert: true }
			).populate('user', ['name', 'avatar']);

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (_req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (_req, res) => {
	try {
		const profile = await Profile.findOne({
			user: _req.params.user_id,
		}).populate('user', ['name', 'avatar']);
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			return res.status(404).json({ msg: 'Profile not found' });
		}
		res.status(500).send('Server error');
	}
});

// @route   DELETE api/profile/
// @desc    Delete profile, user, and all associated posts
// @access  Private
router.delete('/', auth, async (req, res) => {
	try {
		// Cascade delete: Remove all data associated with the user
		// Order matters: delete dependent data first, then the user

		// 1. Remove all posts by this user (prevents orphaned posts)
		await Post.deleteMany({ user: req.user.id });

		// 2. Remove profile
		await Profile.findOneAndDelete({ user: req.user.id });

		// 3. Remove user (last, as it's the parent record)
		await User.findOneAndDelete({ _id: req.user.id });

		// Use 204 No Content for successful deletion (no response body needed)
		res.status(204).send();
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put(
	'/experience',
	[
		auth,
		[
			check('title', 'Title is required').not().isEmpty(),
			check('company', 'Company is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, company, location, from, to, current, description } =
			req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			if (!profile) {
				return res.status(404).json({ msg: 'Profile not found' });
			}

			profile.experience.unshift(newExp);
			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		// Get remove index
		const removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);

		if (removeIndex === -1) {
			return res.status(404).json({ msg: 'Experience not found' });
		}

		profile.experience.splice(removeIndex, 1);
		await profile.save();

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private
router.put(
	'/education',
	[
		auth,
		[
			check('school', 'School is required').not().isEmpty(),
			check('degree', 'Degree is required').not().isEmpty(),
			check('fieldofstudy', 'Field of study is required').not().isEmpty(),
			check('from', 'From date is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { school, degree, fieldofstudy, from, to, current, description } =
			req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });
			if (!profile) {
				return res.status(404).json({ msg: 'Profile not found' });
			}

			profile.education.unshift(newEdu);
			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete('/education/:edu_id', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		// Get remove index
		const removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);

		if (removeIndex === -1) {
			return res.status(404).json({ msg: 'Education not found' });
		}

		profile.education.splice(removeIndex, 1);
		await profile.save();

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

export default router;
