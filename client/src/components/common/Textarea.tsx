import React from 'react';
import clsx from 'clsx';

interface TextareaProps extends Omit<
	React.ComponentPropsWithoutRef<'textarea'>,
	'rows'
> {
	label?: string;
	hint?: string;
	error?: string;
	wrapperClassName?: string;
	autoResize?: boolean;
	minRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	function Textarea(
		{
			label,
			hint,
			error,
			id,
			className,
			wrapperClassName,
			autoResize = true,
			minRows = 1,
			onChange,
			style,
			...props
		},
		forwardedRef,
	) {
		const generatedId = React.useId();
		const textareaId = id ?? generatedId;
		const hintId = hint ? `${textareaId}-hint` : undefined;
		const errorId = error ? `${textareaId}-error` : undefined;
		const describedBy =
			[hintId, errorId].filter(Boolean).join(' ') || undefined;
		const internalRef = React.useRef<HTMLTextAreaElement>(null);

		const setRefs = React.useCallback(
			(node: HTMLTextAreaElement | null) => {
				internalRef.current = node;
				if (!forwardedRef) return;
				if (typeof forwardedRef === 'function') {
					forwardedRef(node);
					return;
				}
				forwardedRef.current = node;
			},
			[forwardedRef],
		);

		const resize = React.useCallback((textarea: HTMLTextAreaElement) => {
			textarea.style.height = 'auto';
			textarea.style.height = `${textarea.scrollHeight}px`;
		}, []);

		React.useLayoutEffect(() => {
			if (!autoResize || !internalRef.current) return;
			resize(internalRef.current);
		}, [autoResize, resize, props.value]);

		React.useEffect(() => {
			if (!autoResize || !internalRef.current) return;
			const textarea = internalRef.current;

			const frameA = requestAnimationFrame(() => {
				resize(textarea);
				requestAnimationFrame(() => {
					resize(textarea);
				});
			});

			let observer: ResizeObserver | undefined;
			if (typeof ResizeObserver !== 'undefined') {
				let resizeTimeout: number | undefined;
				observer = new ResizeObserver(() => {
					if (resizeTimeout) window.clearTimeout(resizeTimeout);
					resizeTimeout = window.setTimeout(() => {
						resize(textarea);
					}, 30); // Debounce to avoid ResizeObserver loop errors
				});
				observer.observe(textarea);
				// Clean up timeout on unmount
				return () => {
					if (resizeTimeout) window.clearTimeout(resizeTimeout);
				};
			}

			return () => {
				cancelAnimationFrame(frameA);
				observer?.disconnect();
			};
		}, [autoResize, resize, props.value]);

		const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
			onChange?.(event);
			if (!autoResize) return;
			resize(event.currentTarget);
		};

		return (
			<div className={clsx('field', wrapperClassName)}>
				{label && (
					<label className="label" htmlFor={textareaId}>
						{label}
					</label>
				)}
				<textarea
					ref={setRefs}
					id={textareaId}
					className={className}
					rows={minRows}
					aria-describedby={describedBy}
					aria-invalid={error ? true : undefined}
					onChange={handleChange}
					style={{
						...style,
						overflow: 'hidden',
						resize: 'none',
					}}
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
	},
);

export default Textarea;
