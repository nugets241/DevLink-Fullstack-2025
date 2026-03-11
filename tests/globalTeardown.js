/**
 * Stops the in-memory MongoDB instance after all test suites complete.
 */
export default async function globalTeardown() {
	if (global.__MONGOD__) {
		await global.__MONGOD__.stop();
	}
}
