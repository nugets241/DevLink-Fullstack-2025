import mongoose from 'mongoose';

/**
 * Connects Mongoose to the in-memory MongoDB URI supplied by globalSetup.
 * Call this in beforeAll() of each test file.
 */
export async function connectTestDB() {
	await mongoose.connect(process.env.MONGO_URI);
}

/**
 * Drops all collections so each test file starts with a clean slate.
 * Call this in beforeEach() if you want full isolation per test, or in
 * afterAll() to clean up after a suite.
 */
export async function clearDB() {
	const collections = mongoose.connection.collections;
	await Promise.all(
		Object.values(collections).map((col) => col.deleteMany({})),
	);
}

/**
 * Disconnects Mongoose after a test suite.
 * Call this in afterAll().
 */
export async function disconnectTestDB() {
	await mongoose.disconnect();
}
