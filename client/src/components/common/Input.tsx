import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.ComponentPropsWithoutRef<'input'> {
	label?: string;
	hint?: string;
	error?: string;
	wrapperClassName?: string;
}

function Input({
	label,
	hint,
	error,
	id,
	className,
	wrapperClassName,
	...props
}: InputProps) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const hintId = hint ? `${inputId}-hint` : undefined;
	const errorId = error ? `${inputId}-error` : undefined;
	const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

	return (
		<div className={clsx('field', wrapperClassName)}>
			{label && (
				<label className="label" htmlFor={inputId}>
					{label}
				</label>
			)}
			<input
				id={inputId}
				className={clsx('input', className)}
				aria-describedby={describedBy}
				aria-invalid={error ? true : undefined}
				{...props}
			/>
			{hint && (
				<p className="hint" id={hintId}>
					{hint}
				</p>
			)}
			{error && (
				<p className="error" id={errorId}>
					{error}
				</p>
			)}
		</div>
	);
}

export default Input;
