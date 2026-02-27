import React from 'react';
import { LuPencil } from 'react-icons/lu';
import Button from '../common/Button';
import Modal from '../common/Modal';

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
	submitLabel = 'Save changes',
	submittingLabel = 'Saving...',
	children,
}: EditableSectionProps) {
	return (
		<>
			<section className={className}>
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
				{content}
			</section>

			<Modal isOpen={isModalOpen} preventClose={isSubmitting}>
				<div className="profile-edit-modal">
					<h2>{modalTitle}</h2>
					<form className="profile-edit-form" onSubmit={onSubmit}>
						<div className="profile-edit-body">
							{children}

							{errorMessage && <p className="error">{errorMessage}</p>}
						</div>

						<div className="profile-edit-actions">
							<Button
								type="button"
								variant="secondary"
								onClick={onClose}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
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
