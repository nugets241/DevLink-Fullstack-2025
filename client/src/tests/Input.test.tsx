import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Input from '../components/common/Input';

describe('Input', () => {
	it('renders the input element', () => {
		render(<Input />);
		expect(screen.getByRole('textbox')).toBeInTheDocument();
	});

	it('renders a label linked to the input via htmlFor', () => {
		render(<Input label="Email address" />);
		const label = screen.getByText('Email address');
		const input = screen.getByRole('textbox');
		expect(label).toBeInTheDocument();
		// The label's for attribute should match the input's id
		expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
	});

	it('shows required indicator when required=true', () => {
		render(<Input label="Password" required />);
		// The asterisk is inside a span with aria-hidden
		const indicator = document.querySelector('.required-indicator');
		expect(indicator).toBeInTheDocument();
	});

	it('renders hint text', () => {
		render(<Input hint="We will never share your email" />);
		expect(
			screen.getByText('We will never share your email'),
		).toBeInTheDocument();
	});

	it('renders error text', () => {
		render(<Input error="This field is required" />);
		expect(screen.getByText('This field is required')).toBeInTheDocument();
	});

	it('sets aria-invalid when error is present', () => {
		render(<Input error="Bad input" />);
		expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
	});

	it('does NOT set aria-invalid when no error', () => {
		render(<Input />);
		expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
	});

	it('sets aria-describedby to the hint/error IDs', () => {
		render(<Input hint="A hint" error="An error" />);
		const input = screen.getByRole('textbox');
		const describedBy = input.getAttribute('aria-describedby') ?? '';
		expect(describedBy).not.toBe('');
	});

	it('applies custom wrapperClassName', () => {
		render(<Input wrapperClassName="my-wrapper" />);
		const wrapper = document.querySelector('.my-wrapper');
		expect(wrapper).toBeInTheDocument();
	});
});
