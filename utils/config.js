// utils/config.js
import assert from 'node:assert';

const required = ['MONGO_URI', 'JWT_TOKEN'];
for (const key of required) {
	assert(process.env[key], `${key} env var is required`);
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = Number(process.env.PORT) || 5000;

export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_TOKEN;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const JWT_ISSUER = process.env.JWT_ISSUER; // optional
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE; // optional

export const ARGON2_OPTIONS = {
	type: 2, // argon2id
	timeCost: Number(process.env.ARGON2_TIME_COST) || 3,
	memoryCost: Number(process.env.ARGON2_MEMORY_COST) || 2 ** 16, // 64MB
	parallelism: Number(process.env.ARGON2_PARALLELISM) || 1,
};

// Convenience flags
export const IS_PROD = NODE_ENV === 'production';
export const IS_TEST = NODE_ENV === 'test';
