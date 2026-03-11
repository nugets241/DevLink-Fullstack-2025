import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/api/auth.js';
import usersRoutes from './routes/api/users.js';
import profileRoutes from './routes/api/profile.js';
import postRoutes from './routes/api/post.js';
import { IS_PROD, NODE_ENV, IS_TEST } from './utils/config.js';

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
// In production: restrict to origins listed in ALLOWED_ORIGINS env var.
// In development/test: allow all origins for convenience.
const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
	: [];

app.use(
	cors({
		origin: IS_PROD
			? (origin, callback) => {
					if (!origin) return callback(null, false);
					if (allowedOrigins.includes(origin)) return callback(null, true);
					callback(new Error(`CORS: origin '${origin}' not allowed`));
				}
			: true,
		credentials: true,
	}),
);

// ─── Rate limiting ───────────────────────────────────────────────────────────
// Skip rate limits in the test environment so tests run without throttling
if (!IS_TEST) {
	const apiLimiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 100,
		standardHeaders: true,
		legacyHeaders: false,
		message: { msg: 'Too many requests, please try again later.' },
	});

	const authLimiter = rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 20,
		standardHeaders: true,
		legacyHeaders: false,
		message: { msg: 'Too many login attempts, please try again later.' },
	});

	app.use('/api/', apiLimiter);
	app.use('/api/auth', authLimiter);
	app.use('/api/users', authLimiter);
}

// ─── Logging ─────────────────────────────────────────────────────────────────
if (!IS_TEST) {
	app.use(morgan(IS_PROD ? 'combined' : 'dev'));
}

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
	res.json({ status: 'ok', env: NODE_ENV });
});

// ─── API routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);

// ─── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
