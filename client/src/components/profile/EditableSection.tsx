import React from 'react';
import { LuPencil } from 'react-icons/lu';
import Button from '../common/Button';
import Modal from '../common/Modal';

type EditableSectionProps = {
	sectionClassName: string;
	headerClassName: string;
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
	sectionClassName,
	headerClassName,
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
			<section className={sectionClassName}>
				<header className={headerClassName}>
					{headerContent}
					<LuPencil className="profile-edit-trigger" onClick={onOpen} />
				</header>
				{content}
			</section>

			<Modal isOpen={isModalOpen} preventClose={isSubmitting}>
				<div className="loading-modal profile-edit-modal">
					<h3>{modalTitle}</h3>
					<form className="profile-edit-form" onSubmit={onSubmit}>
						{children}

						{errorMessage && <p className="error">{errorMessage}</p>}

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
