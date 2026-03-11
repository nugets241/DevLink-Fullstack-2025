import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../components/common/Card';

describe('Card', () => {
	it('renders children', () => {
		render(<Card>Hello card</Card>);
		expect(screen.getByText('Hello card')).toBeInTheDocument();
	});

	it('has the base "card" class', () => {
		const { container } = render(<Card>Content</Card>);
		expect(container.firstChild).toHaveClass('card');
	});

	it('merges additional className', () => {
		const { container } = render(<Card className="extra">Content</Card>);
		expect(container.firstChild).toHaveClass('card', 'extra');
	});

	it('passes through extra div props', () => {
		render(<Card data-testid="my-card">Content</Card>);
		expect(screen.getByTestId('my-card')).toBeInTheDocument();
	});
});
