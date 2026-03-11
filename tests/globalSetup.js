import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

/**
 * Starts an in-memory MongoDB instance once before all test suites.
 * Sets process.env.MONGO_URI so config.js and test workers pick it up.
 */
export default async function globalSetup() {
	mongod = await MongoMemoryServer.create();
	process.env.MONGO_URI = mongod.getUri();
	process.env.JWT_SECRET =
		process.env.JWT_SECRET || 'test-jwt-secret-devlink-at-least-32-chars';
	process.env.NODE_ENV = 'test';

	// Store the instance for teardown
	global.__MONGOD__ = mongod;
}
