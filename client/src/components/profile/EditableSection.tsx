import React from 'react';
import { LuPencil } from 'react-icons/lu';
import { MdOutlineClose } from 'react-icons/md';
import Button from '../common/Button';
import Modal from '../common/Modal';
import clsx from 'clsx';

type EditableSectionProps = {
	className: string;
	headerContent: React.ReactNode;
	content: React.ReactNode;
	isModalOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
	modalTitle: string;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	isSubmitting: boolean;
	errorMessage?: string | null;
	submitLabel?: string;
	submittingLabel?: string;
	children: React.ReactNode;
};

function EditableSection({
	className,
	headerContent,
	content,
	isModalOpen,
	onOpen,
	onClose,
	modalTitle,
	onSubmit,
	isSubmitting,
	errorMessage,
	submitLabel = 'Save',
	submittingLabel = 'Saving...',
	children,
}: EditableSectionProps) {
	return (
		<>
			<section className={clsx('profile-section-card', className)}>
				<header className="profile-section-header">
					{headerContent}
					<button
						type="button"
						className="profile-edit-trigger"
						onClick={onOpen}
						aria-label="Edit section"
					>
						<LuPencil aria-hidden="true" focusable="false" />
					</button>
				</header>
				<div className="profile-contents">{content}</div>
			</section>

			<Modal isOpen={isModalOpen} preventClose={isSubmitting}>
				<div className="profile-edit-modal">
					<div className="profile-modal-header">
						<h2>{modalTitle}</h2>
						<button
							type="button"
							className="profile-modal-close"
							onClick={onClose}
							aria-label="Close modal"
						>
							<MdOutlineClose aria-hidden="true" focusable="false" />
						</button>
					</div>
					<form className="profile-edit-form" onSubmit={onSubmit}>
						<div className="profile-edit-body">
							{children}

							{errorMessage && <p className="error">{errorMessage}</p>}
						</div>

						<div className="profile-edit-footer">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? submittingLabel : submitLabel}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		</>
	);
}

export default EditableSection;
