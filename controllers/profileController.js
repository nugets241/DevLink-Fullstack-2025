import { validationResult } from 'express-validator';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

const sortSkills = (skills) =>
	[...skills].sort((a, b) =>
		a.localeCompare(b, undefined, { sensitivity: 'base' }),
	);

// ─── Profile ────────────────────────────────────────────────────────────────

/**
 * GET /api/profile/me
 * Returns the authenticated user's full profile.
 * @access Private
 */
export async function getMyProfile(req, res) {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			'user',
			['name', 'avatar', 'headline'],
		);
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * PATCH /api/profile
 * Creates or fully updates the authenticated user's profile.
 * @access Private
 */
export async function upsertProfile(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { website, location, about, skills, social, experience, education } =
		req.body;

	try {
		const normalizedSkills =
			skills === undefined || skills === null
				? undefined
				: Array.isArray(skills)
					? skills.map((skill) => String(skill).trim())
					: skills.split(',').map((skill) => skill.trim());
		const sortedSkills =
			normalizedSkills === undefined ? undefined : sortSkills(normalizedSkills);

		const profileFields = {
			user: req.user.id,
			website,
			location,
			about,
			...(sortedSkills !== undefined ? { skills: sortedSkills } : {}),
			social,
			experience,
			education,
		};

		const profile = await Profile.findOneAndUpdate(
			{ user: req.user.id },
			{ $set: profileFields },
			{ new: true, upsert: true, setDefaultsOnInsert: true },
		).populate('user', ['name', 'avatar', 'headline']);

		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * GET /api/profile
 * Returns all profiles.
 * @access Public
 */
export async function getAllProfiles(_req, res) {
	try {
		const profiles = await Profile.find().populate('user', [
			'name',
			'avatar',
			'headline',
		]);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * GET /api/profile/user/:user_id
 * Returns a profile by user ID.
 * @access Public
 */
export async function getProfileByUserId(req, res) {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate('user', ['name', 'avatar', 'headline']);
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
}

/**
 * DELETE /api/profile
 * Cascade-deletes the authenticated user's posts, profile, and account.
 * @access Private
 */
export async function deleteProfile(req, res) {
	try {
		await Post.deleteMany({ user: req.user.id });
		await Profile.findOneAndDelete({ user: req.user.id });
		await User.findOneAndDelete({ _id: req.user.id });
		res.status(204).send();
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

// ─── Experience ──────────────────────────────────────────────────────────────

/**
 * PUT /api/profile/experience
 * Prepends a new experience entry to the profile.
 * @access Private
 */
export async function addExperience(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { title, company, location, from, to, current, description } = req.body;

	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		profile.experience.unshift({
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		});
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * PATCH /api/profile/experience/:exp_id
 * Updates an existing experience entry.
 * @access Private
 */
export async function updateExperience(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { title, company, location, from, to, current, description } = req.body;

	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		const experience = profile.experience.id(req.params.exp_id);
		if (!experience) {
			return res.status(404).json({ msg: 'Experience not found' });
		}

		experience.title = title;
		experience.company = company;
		experience.location = location;
		experience.from = from;
		experience.to = current ? undefined : to;
		experience.current = current;
		experience.description = description;

		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * DELETE /api/profile/experience/:exp_id
 * Removes an experience entry by subdocument ID.
 * @access Private
 */
export async function deleteExperience(req, res) {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

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
}

// ─── Education ───────────────────────────────────────────────────────────────

/**
 * PUT /api/profile/education
 * Prepends a new education entry to the profile.
 * @access Private
 */
export async function addEducation(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { school, degree, fieldofstudy, from, to, current, description } =
		req.body;

	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		profile.education.unshift({
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		});
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * PATCH /api/profile/education/:edu_id
 * Updates an existing education entry.
 * @access Private
 */
export async function updateEducation(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { school, degree, fieldofstudy, from, to, current, description } =
		req.body;

	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		const education = profile.education.id(req.params.edu_id);
		if (!education) {
			return res.status(404).json({ msg: 'Education not found' });
		}

		education.school = school;
		education.degree = degree;
		education.fieldofstudy = fieldofstudy;
		education.from = from;
		education.to = current ? undefined : to;
		education.current = current;
		education.description = description;

		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * DELETE /api/profile/education/:edu_id
 * Removes an education entry by subdocument ID.
 * @access Private
 */
export async function deleteEducation(req, res) {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

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
}

// ─── Skills ──────────────────────────────────────────────────────────────────

/**
 * PUT /api/profile/skills
 * Adds a skill and re-sorts the skills array.
 * @access Private
 */
export async function addSkill(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const normalizedTitle = req.body.title.trim();

	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		profile.skills = profile.skills || [];
		profile.skills = sortSkills([...profile.skills, normalizedTitle]);
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * PATCH /api/profile/skills/:skill_index
 * Replaces a skill at a given index and re-sorts.
 * @access Private
 */
export async function updateSkill(req, res) {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const normalizedTitle = req.body.title.trim();
	const skillIndex = Number(req.params.skill_index);

	if (!Number.isInteger(skillIndex) || skillIndex < 0) {
		return res.status(400).json({ msg: 'Invalid skill index' });
	}

	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		profile.skills = profile.skills || [];
		if (skillIndex >= profile.skills.length) {
			return res.status(404).json({ msg: 'Skill not found' });
		}

		profile.skills[skillIndex] = normalizedTitle;
		profile.skills = sortSkills(profile.skills);
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}

/**
 * DELETE /api/profile/skills/:skill_index
 * Removes a skill at a given index.
 * @access Private
 */
export async function deleteSkill(req, res) {
	const skillIndex = Number(req.params.skill_index);

	if (!Number.isInteger(skillIndex) || skillIndex < 0) {
		return res.status(400).json({ msg: 'Invalid skill index' });
	}

	try {
		const profile = await Profile.findOne({ user: req.user.id });
		if (!profile) {
			return res.status(404).json({ msg: 'Profile not found' });
		}

		profile.skills = profile.skills || [];
		if (skillIndex >= profile.skills.length) {
			return res.status(404).json({ msg: 'Skill not found' });
		}

		profile.skills.splice(skillIndex, 1);
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
}
