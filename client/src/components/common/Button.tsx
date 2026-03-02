import React from 'react';
import clsx from 'clsx';

interface IButton extends React.ComponentPropsWithoutRef<'button'> {
	/**
	 * Select the visual variant for the button. Default is "primary"
	 *
	 * @default "primary"
	 */
	variant?: 'primary' | 'secondary' | 'tertiary' | 'icon';
}

/**
 * Standard button component, which is styled according to M-Files Design System.
 */
function Button({
	type = 'button',
	variant = 'primary',
	className,
	children,
	...props
}: React.PropsWithChildren<IButton>) {
	// Concatenate class names.
	const classNames = clsx(
		'button',
		{
			// Primary button
			['button-primary']: variant === 'primary',

			// Secondary button
			['button-secondary']: variant === 'secondary',

			// Tertiary button
			['button-tertiary']: variant === 'tertiary',

			// Icon button
			['icon-button']: variant === 'icon',
		},
		className,
	);

	return (
		<button type={type} className={classNames} {...props}>
			{children}
		</button>
	);
}

export default Button;
