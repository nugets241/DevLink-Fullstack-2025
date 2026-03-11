/** @type {import('jest').Config} */
export default {
	testEnvironment: 'node',
	// Native ESM – no Babel/TS transform needed
	transform: {},
	// Spin up an in-memory MongoDB once for all suites
	globalSetup: './tests/globalSetup.js',
	globalTeardown: './tests/globalTeardown.js',
	// Per-suite DB connection is handled inside each test file
	testMatch: ['**/tests/**/*.test.js'],
	// Show individual test names in output
	verbose: true,
	// Ensure env vars are present before config.js asserts run
	setupFiles: ['./tests/envSetup.js'],
};
