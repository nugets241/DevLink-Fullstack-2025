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
	required,
	id,
	className,
	wrapperClassName,
	type,
	onClick,
	...props
}: InputProps) {
	const generatedId = React.useId();
	const inputId = id ?? generatedId;
	const inputRef = React.useRef<HTMLInputElement>(null);

	const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
		if (type === 'date' && inputRef.current) {
			try {
				(
					inputRef.current as HTMLInputElement & { showPicker: () => void }
				).showPicker();
			} catch {
				// showPicker not supported in this browser
			}
		}
		onClick?.(e);
	};
	const hintId = hint ? `${inputId}-hint` : undefined;
	const errorId = error ? `${inputId}-error` : undefined;
	const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

	return (
		<div className={clsx('field', wrapperClassName)}>
			{label && (
				<label className="label" htmlFor={inputId}>
					{label}
					{required && (
						<span className="required-indicator" aria-hidden="true">
							*
						</span>
					)}
				</label>
			)}
			<input
				ref={inputRef}
				id={inputId}
				type={type}
				className={className}
				aria-describedby={describedBy}
				aria-invalid={error ? true : undefined}
				required={required}
				onClick={handleClick}
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
