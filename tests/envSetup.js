/**
 * Sets required environment variables before any module is loaded.
 * Real values for MONGO_URI are written by globalSetup.js after the
 * in-memory MongoDB server starts; these are fallbacks that satisfy the
 * assert() calls in utils/config.js at import time.
 */
process.env.MONGO_URI =
	process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devlink_test';
process.env.JWT_SECRET =
	process.env.JWT_SECRET || 'test-jwt-secret-devlink-at-least-32-chars';
process.env.NODE_ENV = 'test';
