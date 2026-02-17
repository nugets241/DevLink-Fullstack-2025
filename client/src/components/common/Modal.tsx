import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
	isOpen: boolean;
	message?: string;
	children?: React.ReactNode;
}

export default function Modal({ isOpen, message, children }: ModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (isOpen) {
			dialogRef.current?.showModal();
		} else {
			dialogRef.current?.close();
		}
	}, [isOpen]);

	const modalRoot = document.getElementById('modal');
	if (!modalRoot) return null;

	return createPortal(
		<dialog ref={dialogRef} className="loading-dialog">
			{children ?? (message ? <p>{message}</p> : null)}
		</dialog>,
		modalRoot,
	);
}
