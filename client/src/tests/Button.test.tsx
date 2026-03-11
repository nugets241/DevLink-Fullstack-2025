import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../components/common/Button';

describe('Button', () => {
	it('renders children', () => {
		render(<Button>Click me</Button>);
		expect(
			screen.getByRole('button', { name: 'Click me' }),
		).toBeInTheDocument();
	});

	it('defaults to type="button" to prevent accidental form submission', () => {
		render(<Button>Submit</Button>);
		expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
	});

	it('applies primary class by default', () => {
		render(<Button>Primary</Button>);
		expect(screen.getByRole('button')).toHaveClass('button-primary');
	});

	it('applies secondary class when variant="secondary"', () => {
		render(<Button variant="secondary">Secondary</Button>);
		expect(screen.getByRole('button')).toHaveClass('button-secondary');
	});

	it('applies tertiary class when variant="tertiary"', () => {
		render(<Button variant="tertiary">Tertiary</Button>);
		expect(screen.getByRole('button')).toHaveClass('button-tertiary');
	});

	it('applies icon-button class when variant="icon"', () => {
		render(<Button variant="icon">Icon</Button>);
		expect(screen.getByRole('button')).toHaveClass('icon-button');
	});

	it('merges additional className', () => {
		render(<Button className="my-class">Button</Button>);
		expect(screen.getByRole('button')).toHaveClass('my-class');
	});

	it('calls onClick when clicked', async () => {
		const handler = vi.fn();
		render(<Button onClick={handler}>Click</Button>);
		await userEvent.click(screen.getByRole('button'));
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('does not call onClick when disabled', async () => {
		const handler = vi.fn();
		render(
			<Button onClick={handler} disabled>
				Click
			</Button>,
		);
		await userEvent.click(screen.getByRole('button'));
		expect(handler).not.toHaveBeenCalled();
	});

	it('passes through arbitrary HTML button props', () => {
		render(<Button aria-label="close dialog">X</Button>);
		expect(screen.getByRole('button')).toHaveAttribute(
			'aria-label',
			'close dialog',
		);
	});
});
