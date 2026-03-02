import React from 'react';
import { LuPencil, LuPlus } from 'react-icons/lu';
import { MdOutlineClose } from 'react-icons/md';
import Button from '../common/Button';
import Modal from '../common/Modal';
import clsx from 'clsx';

function hasRequiredField(node: React.ReactNode): boolean {
	let found = false;

	const visit = (children: React.ReactNode) => {
		React.Children.forEach(children, (child) => {
			if (found || !React.isValidElement(child)) return;

			const elementProps = child.props as {
				required?: boolean;
				children?: React.ReactNode;
			};

			if (elementProps.required) {
				found = true;
				return;
			}

			if (elementProps.children) {
				visit(elementProps.children);
			}
		});
	};

	visit(node);
	return found;
}

type EditableSectionProps = {
	className: string;
	headerContent: React.ReactNode;
	content: React.ReactNode;
	triggerVariant?: 'edit' | 'add';
	triggerIcon?: React.ReactNode;
	triggerAriaLabel?: string;
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
	triggerVariant = 'edit',
	triggerIcon,
	triggerAriaLabel = 'Edit section',
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
	const resolvedTriggerIcon =
		triggerIcon ??
		(triggerVariant === 'add' ? (
			<LuPlus aria-hidden="true" focusable="false" />
		) : (
			<LuPencil aria-hidden="true" focusable="false" />
		));
	const showsRequiredHint = React.useMemo(
		() => hasRequiredField(children),
		[children],
	);

	return (
		<>
			<section className={clsx('profile-section-card', className)}>
				<header className="profile-section-header">
					{headerContent}
					<Button
						type="button"
						variant="icon"
						onClick={onOpen}
						aria-label={triggerAriaLabel}
					>
						{resolvedTriggerIcon}
					</Button>
				</header>
				<div className="profile-contents">{content}</div>
			</section>

			<Modal isOpen={isModalOpen} preventClose={isSubmitting}>
				<div className="profile-edit-modal">
					<div className="profile-modal-header">
						<h2>{modalTitle}</h2>
						<Button
							type="button"
							variant="icon"
							onClick={onClose}
							aria-label="Close modal"
						>
							<MdOutlineClose aria-hidden="true" focusable="false" />
						</Button>
					</div>
					<form className="form profile-edit-form" onSubmit={onSubmit}>
						<div className="profile-edit-body">
							{showsRequiredHint && (
								<p className="required-fields-note">
									<span aria-hidden="true">*</span> Indicates required
								</p>
							)}
							{children}
						</div>
						{errorMessage && <p className="error">{errorMessage}</p>}

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
