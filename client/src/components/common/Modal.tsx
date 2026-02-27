import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

interface ModalProps {
	isOpen: boolean;
	message?: string;
	children?: React.ReactNode;
	preventClose?: boolean;
	className?: string;
}

export default function Modal({
	isOpen,
	message,
	children,
	preventClose = false,
	className,
}: ModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			if (!dialog.open) {
				dialog.showModal();
			}
		} else {
			dialog.close();
		}
	}, [isOpen]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
		if (event.key === 'Escape' && preventClose) {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	const modalRoot = document.getElementById('modal');
	if (!modalRoot) return null;

	return createPortal(
		<dialog
			ref={dialogRef}
			className={clsx('dialog', className)}
			onKeyDown={handleKeyDown}
		>
			{children ?? (message ? <p>{message}</p> : null)}
		</dialog>,
		modalRoot,
	);
}
