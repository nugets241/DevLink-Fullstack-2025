import React from 'react';
import Button from './Button';
import Modal from './Modal';

type ConfirmModalProps = {
	isOpen: boolean;
	title: string;
	description: React.ReactNode;
	details?: React.ReactNode;
	errorMessage?: string | null;
	confirmLabel?: string;
	confirmingLabel?: string;
	cancelLabel?: string;
	isConfirming?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

function ConfirmModal({
	isOpen,
	title,
	description,
	details,
	errorMessage,
	confirmLabel = 'Confirm',
	confirmingLabel = 'Processing...',
	cancelLabel = 'Cancel',
	isConfirming = false,
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	return (
		<Modal isOpen={isOpen} preventClose={isConfirming}>
			<div className="confirm-modal">
				<h3>{title}</h3>
				<p>{description}</p>
				{details && <p>{details}</p>}
				{errorMessage && <p className="error">{errorMessage}</p>}
				<div className="confirm-modal-actions">
					<Button
						type="button"
						variant="tertiary"
						onClick={onCancel}
						disabled={isConfirming}
					>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						variant="primary"
						onClick={onConfirm}
						disabled={isConfirming}
					>
						{isConfirming ? confirmingLabel : confirmLabel}
					</Button>
				</div>
			</div>
		</Modal>
	);
}

export default ConfirmModal;
