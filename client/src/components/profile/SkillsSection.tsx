import React from 'react';
import { LuPencil, LuX } from 'react-icons/lu';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	addSkill,
	clearProfileErrors,
	clearProfileFieldError,
	deleteSkill,
	updateSkill,
} from '../../store/slices/profileSlice';
import Button from '../common/Button';
import ConfirmModal from '../common/ConfirmModal';
import Input from '../common/Input';
import EditableSection from './EditableSection';
import useEntrySectionController from './hooks/useEntrySectionController';

type SkillFormValues = {
	title: string;
};

const initialSkillFormValues: SkillFormValues = {
	title: '',
};

function SkillsSection() {
	const dispatch = useAppDispatch();
	const [skillTitleError, setSkillTitleError] = React.useState<string | null>(
		null,
	);
	const {
		profile,
		status: profileStatus,
		error: profileError,
		fieldErrors: profileFieldErrors,
	} = useAppSelector((state) => state.profile);
	const {
		isModalOpen: isSkillModalOpen,
		formValues: skillFormValues,
		setFormValues: setSkillFormValues,
		deletingItemId: deletingSkillId,
		confirmingItem: confirmingSkill,
		editingItemId: editingSkillId,
		openCreateModal,
		openEditModal,
		closeModal: closeSkillModal,
		openDeleteConfirmation,
		closeDeleteConfirmation,
		startDeleting,
		stopDeleting,
		clearConfirmedItem,
	} = useEntrySectionController<SkillFormValues>({
		initialFormValues: initialSkillFormValues,
		clearErrors: () => dispatch(clearProfileErrors()),
	});

	const skills = profile?.skills ?? [];

	const openEditSkillModal = (skillIndex: number, title: string) => {
		openEditModal(String(skillIndex), {
			title,
		});
	};

	const handleSkillInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const { name, value } = event.target;

		setSkillFormValues((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === 'title' && skillTitleError) {
			setSkillTitleError(null);
		}

		dispatch(clearProfileFieldError(name));
	};

	const handleSkillSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const normalizedTitle = skillFormValues.title.trim();
		if (!normalizedTitle) {
			setSkillTitleError('Skill is a required field');
			return;
		}

		setSkillTitleError(null);

		const payload = {
			title: normalizedTitle,
		};

		const actionResult = editingSkillId
			? await dispatch(
					updateSkill({
						skillIndex: Number(editingSkillId),
						...payload,
					}),
				)
			: await dispatch(addSkill(payload));

		if (
			addSkill.fulfilled.match(actionResult) ||
			updateSkill.fulfilled.match(actionResult)
		) {
			closeSkillModal();
		}
	};

	const handleDeleteSkill = async () => {
		if (!confirmingSkill) return;
		const skillIndex = Number(confirmingSkill.id);
		if (!Number.isInteger(skillIndex) || skillIndex < 0) return;
		startDeleting(confirmingSkill.id);
		const result = await dispatch(deleteSkill(skillIndex));
		if (deleteSkill.fulfilled.match(result)) {
			stopDeleting();
			clearConfirmedItem();
			return;
		}
		stopDeleting();
	};

	return (
		<>
			<EditableSection
				className="card"
				headerContent={<h2>Skills</h2>}
				triggerVariant="add"
				triggerAriaLabel="Add skill"
				content={
					<div className="skill-list">
						{skills.length === 0 ? (
							<p className="skill-empty">Add your skills.</p>
						) : (
							skills.map((skill, skillIndex) => (
								<article key={`${skill}-${skillIndex}`} className="skill-item">
									<header className="skill-item-header">
										<h3>{skill}</h3>
										<div>
											<Button
												type="button"
												variant="icon"
												onClick={() =>
													openDeleteConfirmation(String(skillIndex), skill)
												}
												aria-label={`Delete skill ${skill}`}
											>
												<LuX aria-hidden="true" focusable="false" />
											</Button>
											<Button
												type="button"
												variant="icon"
												onClick={() => openEditSkillModal(skillIndex, skill)}
												aria-label={`Edit skill ${skill}`}
											>
												<LuPencil aria-hidden="true" focusable="false" />
											</Button>
										</div>
									</header>
								</article>
							))
						)}
					</div>
				}
				isModalOpen={isSkillModalOpen}
				onOpen={openCreateModal}
				onClose={closeSkillModal}
				modalTitle={editingSkillId ? 'Edit skill' : 'Add skill'}
				onSubmit={handleSkillSubmit}
				isSubmitting={profileStatus === 'loading' && !deletingSkillId}
				errorMessage={profileError}
				submitLabel={editingSkillId ? 'Update skill' : 'Add skill'}
				submittingLabel="Saving..."
			>
				<Input
					name="title"
					label="Skill"
					required
					value={skillFormValues.title}
					onChange={handleSkillInputChange}
					error={skillTitleError ?? profileFieldErrors.title}
				/>
			</EditableSection>

			<ConfirmModal
				isOpen={Boolean(confirmingSkill)}
				title="Delete skill?"
				description={
					<>
						This will remove the skill <strong>{confirmingSkill?.label}</strong>
						.
					</>
				}
				details="This action cannot be undone."
				errorMessage={profileError}
				cancelLabel="Cancel"
				confirmLabel="Delete"
				confirmingLabel="Deleting..."
				isConfirming={Boolean(deletingSkillId)}
				onCancel={closeDeleteConfirmation}
				onConfirm={handleDeleteSkill}
			/>
		</>
	);
}

export default SkillsSection;
