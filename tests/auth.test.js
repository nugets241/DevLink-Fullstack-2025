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

// Helper: register a user and return the token + user
async function registerUser(overrides = {}) {
	const payload = {
		name: 'Test User',
		email: 'test@example.com',
		password: 'password123',
		...overrides,
	};
	const res = await request(app).post('/api/users').send(payload);
	return res.body;
}

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearDB);

// ─── Registration ─────────────────────────────────────────────────────────────

describe('POST /api/users – register', () => {
	it('creates a new user and returns a token + user object', async () => {
		const res = await request(app).post('/api/users').send({
			name: 'Alice',
			email: 'alice@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('token');
		expect(res.body.user).toMatchObject({
			name: 'Alice',
			email: 'alice@example.com',
		});
		// Password must NOT be returned
		expect(res.body.user).not.toHaveProperty('password');
	});

	it('rejects duplicate email with 409', async () => {
		await registerUser({ email: 'dup@example.com' });
		const res = await request(app).post('/api/users').send({
			name: 'Bob',
			email: 'dup@example.com',
			password: 'password123',
		});
		expect(res.status).toBe(409);
	});

	it('rejects missing name with 400', async () => {
		const res = await request(app).post('/api/users').send({
			email: 'no-name@example.com',
			password: 'password123',
		});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('rejects invalid email with 400', async () => {
		const res = await request(app).post('/api/users').send({
			name: 'Bob',
			email: 'not-an-email',
			password: 'password123',
		});
		expect(res.status).toBe(400);
	});

	it('rejects short password with 400', async () => {
		const res = await request(app).post('/api/users').send({
			name: 'Bob',
			email: 'bob@example.com',
			password: '123',
		});
		expect(res.status).toBe(400);
	});
});

// ─── Login ────────────────────────────────────────────────────────────────────

describe('POST /api/auth – login', () => {
	beforeEach(() =>
		registerUser({ email: 'login@example.com', password: 'mypassword' }),
	);

	it('returns a token for valid credentials', async () => {
		const res = await request(app).post('/api/auth').send({
			email: 'login@example.com',
			password: 'mypassword',
		});
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('token');
		expect(res.body.user.email).toBe('login@example.com');
	});

	it('rejects wrong password with 401', async () => {
		const res = await request(app).post('/api/auth').send({
			email: 'login@example.com',
			password: 'wrongpassword',
		});
		expect(res.status).toBe(401);
	});

	it('rejects unknown email with 401', async () => {
		const res = await request(app).post('/api/auth').send({
			email: 'nobody@example.com',
			password: 'mypassword',
		});
		expect(res.status).toBe(401);
	});

	it('rejects missing email with 400', async () => {
		const res = await request(app).post('/api/auth').send({
			password: 'mypassword',
		});
		expect(res.status).toBe(400);
	});
});

// ─── Get current user ─────────────────────────────────────────────────────────

describe('GET /api/auth – current user', () => {
	it('returns user data for a valid token', async () => {
		const { token, user } = await registerUser({ email: 'me@example.com' });
		const res = await request(app)
			.get('/api/auth')
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body._id).toBeDefined();
		expect(res.body.email).toBe(user.email);
		expect(res.body.password).toBeUndefined();
	});

	it('returns 401 without a token', async () => {
		const res = await request(app).get('/api/auth');
		expect(res.status).toBe(401);
	});

	it('returns 401 with a fake token', async () => {
		const res = await request(app)
			.get('/api/auth')
			.set('Authorization', 'Bearer fake.token.here');
		expect(res.status).toBe(401);
	});
});
