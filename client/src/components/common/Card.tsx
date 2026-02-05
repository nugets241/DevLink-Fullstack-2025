import React from 'react';
import clsx from 'clsx';

interface ICard extends React.ComponentPropsWithoutRef<'div'> {
	/**
	 * Optional additional className to apply to the card
	 */
	className?: string;
}

/**
 * Base card component for displaying content in a styled container.
 * Provides default styling with hover effects.
 */
function Card({
	className,
	children,
	...props
}: React.PropsWithChildren<ICard>) {
	const classNames = clsx('card', className);

	return (
		<div className={classNames} {...props}>
			{children}
		</div>
	);
}

export default Card;
