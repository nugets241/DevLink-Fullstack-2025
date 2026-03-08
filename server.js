import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import connectDB from './db.js';
import authRoutes from './routes/api/auth.js';
import usersRoutes from './routes/api/users.js';
import profileRoutes from './routes/api/profile.js';
import postRoutes from './routes/api/post.js';
import { PORT } from './utils/config.js';
import dns from 'node:dns/promises';

// Fix DNS resolution issue for MongoDB Atlas SRV records
// This resolves "querySrv ECONNREFUSED" errors on some machines
dns.setServers(['1.1.1.1', '8.8.8.8']);

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Security headers
app.use(helmet());
// CORS - allow all by default during development; lock down in production
app.use(cors());
// Body parsers with size limits to avoid large payload DoS
app.use(express.json({ limit: '5mb' })); // Parses JSON bodies (application/json)
app.use(express.urlencoded({ extended: false, limit: '5mb' })); // Parses urlencoded bodies (form submissions)

app.get('/', (_req, res) => {
	res.send('API is running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);

// Start server

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`);
});

// Basic error handler (must be after routes)
app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).json({ error: err.message || 'Server error' });
});
