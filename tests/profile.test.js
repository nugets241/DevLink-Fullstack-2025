import {
	describe,
	it,
	expect,
	beforeAll,
	afterAll,
	beforeEach,
} from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connectTestDB, clearDB, disconnectTestDB } from './dbHelper.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function register(email = 'user@example.com', name = 'Test User') {
	const res = await request(app).post('/api/users').send({
		name,
		email,
		password: 'password123',
	});
	return { token: res.body.token, user: res.body.user };
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearDB);

// ─── GET /api/profile/me ──────────────────────────────────────────────────────

describe('GET /api/profile/me', () => {
	it('returns the authenticated user profile', async () => {
		const { token } = await register();
		const res = await request(app)
			.get('/api/profile/me')
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('user');
	});

	it('returns 401 without auth', async () => {
		const res = await request(app).get('/api/profile/me');
		expect(res.status).toBe(401);
	});
});

// ─── PATCH /api/profile ───────────────────────────────────────────────────────

describe('PATCH /api/profile', () => {
	it('creates/updates profile with about and skills', async () => {
		const { token } = await register();
		const res = await request(app)
			.patch('/api/profile')
			.set('Authorization', `Bearer ${token}`)
			.send({ about: 'Software developer', skills: ['JavaScript', 'Node.js'] });

		expect(res.status).toBe(200);
		expect(res.body.about).toBe('Software developer');
		expect(res.body.skills).toContain('JavaScript');
	});

	it('rejects invalid website URL', async () => {
		const { token } = await register();
		const res = await request(app)
			.patch('/api/profile')
			.set('Authorization', `Bearer ${token}`)
			.send({ website: 'not-a-url' });

		expect(res.status).toBe(400);
	});
});

// ─── GET /api/profile ────────────────────────────────────────────────────────

describe('GET /api/profile', () => {
	it('returns an array of all profiles', async () => {
		await register('a@example.com');
		await register('b@example.com', 'Bob');

		const res = await request(app).get('/api/profile');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(2);
	});
});

// ─── GET /api/profile/user/:user_id ──────────────────────────────────────────

describe('GET /api/profile/user/:user_id', () => {
	it('returns a profile by user ID', async () => {
		const { user } = await register();
		const res = await request(app).get(`/api/profile/user/${user.id}`);
		expect(res.status).toBe(200);
		expect(res.body.user._id).toBe(user.id);
	});

	it('returns 404 for unknown user ID', async () => {
		const res = await request(app).get(
			'/api/profile/user/6642a0f5e2e5d3c4b5a6f001',
		);
		expect(res.status).toBe(404);
	});
});

// ─── Experience CRUD ──────────────────────────────────────────────────────────

describe('Experience CRUD', () => {
	const experiencePayload = {
		title: 'Engineer',
		company: 'Acme Corp',
		from: '2020-01-01',
		current: true,
	};

	it('adds an experience entry', async () => {
		const { token } = await register();
		const res = await request(app)
			.put('/api/profile/experience')
			.set('Authorization', `Bearer ${token}`)
			.send(experiencePayload);

		expect(res.status).toBe(200);
		expect(res.body.experience[0].title).toBe('Engineer');
	});

	it('deletes an experience entry', async () => {
		const { token } = await register();
		const addRes = await request(app)
			.put('/api/profile/experience')
			.set('Authorization', `Bearer ${token}`)
			.send(experiencePayload);

		const expId = addRes.body.experience[0]._id;
		const delRes = await request(app)
			.delete(`/api/profile/experience/${expId}`)
			.set('Authorization', `Bearer ${token}`);

		expect(delRes.status).toBe(200);
		expect(delRes.body.experience).toHaveLength(0);
	});
});

// ─── Education CRUD ───────────────────────────────────────────────────────────

describe('Education CRUD', () => {
	const educationPayload = {
		school: 'MIT',
		degree: 'BSc',
		fieldofstudy: 'Computer Science',
		from: '2016-09-01',
		current: true,
	};

	it('adds an education entry', async () => {
		const { token } = await register();
		const res = await request(app)
			.put('/api/profile/education')
			.set('Authorization', `Bearer ${token}`)
			.send(educationPayload);

		expect(res.status).toBe(200);
		expect(res.body.education[0].school).toBe('MIT');
	});
});

// ─── Skills CRUD ──────────────────────────────────────────────────────────────

describe('Skills CRUD', () => {
	it('adds a skill', async () => {
		const { token } = await register();
		const res = await request(app)
			.put('/api/profile/skills')
			.set('Authorization', `Bearer ${token}`)
			.send({ title: 'TypeScript' });

		expect(res.status).toBe(200);
		expect(res.body.skills).toContain('TypeScript');
	});

	it('deletes a skill by index', async () => {
		const { token } = await register();
		await request(app)
			.put('/api/profile/skills')
			.set('Authorization', `Bearer ${token}`)
			.send({ title: 'Python' });

		const delRes = await request(app)
			.delete('/api/profile/skills/0')
			.set('Authorization', `Bearer ${token}`);

		expect(delRes.status).toBe(200);
		expect(delRes.body.skills).not.toContain('Python');
	});
});

// ─── DELETE /api/profile (account deletion) ───────────────────────────────────

describe('DELETE /api/profile', () => {
	it('deletes the account and returns 204', async () => {
		const { token } = await register();
		const res = await request(app)
			.delete('/api/profile')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(204);
	});
});
