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

async function registerAndLogin(
	email = 'user@example.com',
	password = 'password123',
) {
	await request(app).post('/api/users').send({
		name: 'Test User',
		email,
		password,
	});
	const res = await request(app).post('/api/auth').send({ email, password });
	return res.body.token;
}

async function createPost(token, text = 'Hello world') {
	return request(app)
		.post('/api/posts')
		.set('Authorization', `Bearer ${token}`)
		.send({ text });
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

beforeAll(connectTestDB);
afterAll(disconnectTestDB);
beforeEach(clearDB);

// ─── GET /api/posts ───────────────────────────────────────────────────────────

describe('GET /api/posts', () => {
	it('returns 401 without auth', async () => {
		const res = await request(app).get('/api/posts');
		expect(res.status).toBe(401);
	});

	it('returns paginated post list', async () => {
		const token = await registerAndLogin();
		await createPost(token, 'Post one');
		await createPost(token, 'Post two');

		const res = await request(app)
			.get('/api/posts?page=1&limit=10')
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.posts).toHaveLength(2);
		expect(res.body.pagination.totalPosts).toBe(2);
	});

	it('returns posts newest-first', async () => {
		const token = await registerAndLogin();
		await createPost(token, 'First');
		await createPost(token, 'Second');

		const res = await request(app)
			.get('/api/posts')
			.set('Authorization', `Bearer ${token}`);

		expect(res.body.posts[0].text).toBe('Second');
	});
});

// ─── POST /api/posts ──────────────────────────────────────────────────────────

describe('POST /api/posts', () => {
	it('creates a post with text', async () => {
		const token = await registerAndLogin();
		const res = await createPost(token, 'My new post');

		expect(res.status).toBe(200);
		expect(res.body.text).toBe('My new post');
		expect(res.body._id).toBeDefined();
	});

	it('returns 400 when neither text nor image provided', async () => {
		const token = await registerAndLogin();
		const res = await request(app)
			.post('/api/posts')
			.set('Authorization', `Bearer ${token}`)
			.send({});

		expect(res.status).toBe(400);
	});

	it('returns 401 without auth', async () => {
		const res = await request(app).post('/api/posts').send({ text: 'hi' });
		expect(res.status).toBe(401);
	});
});

// ─── GET /api/posts/:id ───────────────────────────────────────────────────────

describe('GET /api/posts/:id', () => {
	it('returns a single post by ID', async () => {
		const token = await registerAndLogin();
		const created = await createPost(token, 'Specific post');
		const postId = created.body._id;

		const res = await request(app)
			.get(`/api/posts/${postId}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body._id).toBe(postId);
		expect(res.body.text).toBe('Specific post');
	});

	it('returns 404 for unknown ID', async () => {
		const token = await registerAndLogin();
		const res = await request(app)
			.get('/api/posts/6642a0f5e2e5d3c4b5a6f001')
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(404);
	});
});

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────

describe('DELETE /api/posts/:id', () => {
	it('deletes a post the user owns', async () => {
		const token = await registerAndLogin();
		const created = await createPost(token, 'To delete');
		const postId = created.body._id;

		const del = await request(app)
			.delete(`/api/posts/${postId}`)
			.set('Authorization', `Bearer ${token}`);

		expect(del.status).toBe(200);
		expect(del.body.msg).toBe('Post deleted');
	});

	it('returns 401 when another user tries to delete', async () => {
		const ownerToken = await registerAndLogin('owner@example.com');
		const otherToken = await registerAndLogin(
			'other@example.com',
			'password123',
		);
		const created = await createPost(ownerToken, 'Owned post');
		const postId = created.body._id;

		const res = await request(app)
			.delete(`/api/posts/${postId}`)
			.set('Authorization', `Bearer ${otherToken}`);

		expect(res.status).toBe(401);
	});
});

// ─── PUT /api/posts/:id/like and unlike ───────────────────────────────────────

describe('PUT /api/posts/:id/like and unlike', () => {
	it('likes then unlikes a post', async () => {
		const token = await registerAndLogin();
		const created = await createPost(token, 'Likeable');
		const postId = created.body._id;

		const likeRes = await request(app)
			.put(`/api/posts/${postId}/like`)
			.set('Authorization', `Bearer ${token}`);
		expect(likeRes.status).toBe(200);
		expect(likeRes.body).toHaveLength(1);

		const unlikeRes = await request(app)
			.put(`/api/posts/${postId}/unlike`)
			.set('Authorization', `Bearer ${token}`);
		expect(unlikeRes.status).toBe(200);
		expect(unlikeRes.body).toHaveLength(0);
	});

	it('returns 400 on duplicate like', async () => {
		const token = await registerAndLogin();
		const created = await createPost(token, 'Post');
		const postId = created.body._id;

		await request(app)
			.put(`/api/posts/${postId}/like`)
			.set('Authorization', `Bearer ${token}`);

		const res = await request(app)
			.put(`/api/posts/${postId}/like`)
			.set('Authorization', `Bearer ${token}`);
		expect(res.status).toBe(400);
	});
});

// ─── Comments ─────────────────────────────────────────────────────────────────

describe('POST /api/posts/:id/comments', () => {
	it('adds a comment to a post', async () => {
		const token = await registerAndLogin();
		const created = await createPost(token, 'Commentable');
		const postId = created.body._id;

		const res = await request(app)
			.post(`/api/posts/${postId}/comments`)
			.set('Authorization', `Bearer ${token}`)
			.send({ text: 'Great post!' });

		expect(res.status).toBe(200);
		expect(res.body[0].text).toBe('Great post!');
	});

	it('returns 400 for empty comment', async () => {
		const token = await registerAndLogin();
		const created = await createPost(token, 'Post');
		const postId = created.body._id;

		const res = await request(app)
			.post(`/api/posts/${postId}/comments`)
			.set('Authorization', `Bearer ${token}`)
			.send({ text: '' });

		expect(res.status).toBe(400);
	});
});
