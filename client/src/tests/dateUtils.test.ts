import { describe, it, expect } from 'vitest';
import {
	normalizeDateInput,
	formatDateLabel,
} from '../components/profile/utils/date';

describe('normalizeDateInput', () => {
	it('returns empty string for undefined', () => {
		expect(normalizeDateInput(undefined)).toBe('');
	});

	it('trims ISO datetime to YYYY-MM-DD', () => {
		expect(normalizeDateInput('2023-06-15T10:30:00.000Z')).toBe('2023-06-15');
	});

	it('returns the value unchanged if it is already a date string', () => {
		expect(normalizeDateInput('2020-01-01')).toBe('2020-01-01');
	});
});

describe('formatDateLabel', () => {
	it('returns empty string for undefined', () => {
		expect(formatDateLabel(undefined)).toBe('');
	});

	it('formats a valid ISO date string to a readable month/year label', () => {
		// We cannot assert the exact locale string since it depends on the runner locale,
		// but we can verify it is non-empty and contains the year.
		const result = formatDateLabel('2023-06-15');
		expect(result).toBeTruthy();
		expect(result).toContain('2023');
	});

	it('returns the raw value for an invalid date string', () => {
		expect(formatDateLabel('not-a-date')).toBe('not-a-date');
	});
});
