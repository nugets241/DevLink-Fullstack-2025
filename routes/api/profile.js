import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { check } from 'express-validator';
import {
	getMyProfile,
	upsertProfile,
	getAllProfiles,
	getProfileByUserId,
	deleteProfile,
	addExperience,
	updateExperience,
	deleteExperience,
	addEducation,
	updateEducation,
	deleteEducation,
	addSkill,
	updateSkill,
	deleteSkill,
} from '../../controllers/profileController.js';

const router = Router();

// ─── Validators ──────────────────────────────────────────────────────────────

const experienceValidators = [
	check('title', 'Title is required').not().isEmpty(),
	check('company', 'Company is required').not().isEmpty(),
	check('from', 'From date is required').not().isEmpty(),
	check('to').custom((value, { req }) => {
		const isCurrent = req.body.current === true || req.body.current === 'true';
		if (!isCurrent && !value) {
			throw new Error('To date is required when experience is not current');
		}
		return true;
	}),
	check('to').custom((value, { req }) => {
		const isCurrent = req.body.current === true || req.body.current === 'true';
		if (isCurrent || !value || !req.body.from) return true;
		const fromDate = new Date(req.body.from);
		const toDate = new Date(value);
		if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
			throw new Error('From and To must be valid dates');
		}
		if (toDate < fromDate) {
			throw new Error('To date must be on or after From date');
		}
		return true;
	}),
];

const educationValidators = [
	check('school', 'School is required').not().isEmpty(),
	check('degree', 'Degree is required').not().isEmpty(),
	check('fieldofstudy', 'Field of study is required').not().isEmpty(),
	check('from', 'From date is required').not().isEmpty(),
	check('to').custom((value, { req }) => {
		const isCurrent = req.body.current === true || req.body.current === 'true';
		if (!isCurrent && !value) {
			throw new Error('To date is required when education is not current');
		}
		return true;
	}),
	check('to').custom((value, { req }) => {
		const isCurrent = req.body.current === true || req.body.current === 'true';
		if (isCurrent || !value || !req.body.from) return true;
		const fromDate = new Date(req.body.from);
		const toDate = new Date(value);
		if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
			throw new Error('From and To must be valid dates');
		}
		if (toDate < fromDate) {
			throw new Error('To date must be on or after From date');
		}
		return true;
	}),
];

const profileUpdateValidators = [
	check('skills')
		.optional({ nullable: true })
		.custom((value) => {
			if (Array.isArray(value)) {
				if (value.some((skill) => String(skill).trim().length === 0)) {
					throw new Error('Skill is a required field');
				}
				return true;
			}
			if (typeof value === 'string') {
				if (value.split(',').some((skill) => skill.trim().length === 0)) {
					throw new Error('Skill is a required field');
				}
				return true;
			}
			throw new Error('Skills must be a string or an array of strings');
		}),
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
];

const skillValidators = [
	check('title', 'Skill is a required field').trim().notEmpty(),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

router.get('/me', auth, getMyProfile);
router.patch('/', [auth, ...profileUpdateValidators], upsertProfile);
router.get('/', getAllProfiles);
router.get('/user/:user_id', getProfileByUserId);
router.delete('/', auth, deleteProfile);

router.put('/experience', [auth, ...experienceValidators], addExperience);
router.patch(
	'/experience/:exp_id',
	[auth, ...experienceValidators],
	updateExperience,
);
router.delete('/experience/:exp_id', auth, deleteExperience);

router.put('/education', [auth, ...educationValidators], addEducation);
router.patch(
	'/education/:edu_id',
	[auth, ...educationValidators],
	updateEducation,
);
router.delete('/education/:edu_id', auth, deleteEducation);

router.put('/skills', [auth, ...skillValidators], addSkill);
router.patch('/skills/:skill_index', [auth, ...skillValidators], updateSkill);
router.delete('/skills/:skill_index', auth, deleteSkill);

export default router;
