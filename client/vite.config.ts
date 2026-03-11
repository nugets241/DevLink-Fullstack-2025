/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		port: 5173,
	},
	test: {
		// Simulate a browser DOM environment
		environment: 'jsdom',
		// Import jest-dom matchers globally (toBeInTheDocument, etc.)
		setupFiles: ['./src/tests/setup.ts'],
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: ['src/main.tsx', 'src/tests/**'],
		},
	},
});
