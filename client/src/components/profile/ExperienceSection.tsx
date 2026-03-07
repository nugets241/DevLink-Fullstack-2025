import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	addExperience,
	clearProfileErrors,
	clearProfileFieldError,
	deleteExperience,
	updateExperience,
} from '../../store/slices/profileSlice';
import ConfirmModal from '../common/ConfirmModal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import EditableSection from './EditableSection';
import useEntrySectionController from './hooks/useEntrySectionController';
import ProfileEntryItem from './ProfileEntryItem';
import { formatDateLabel, normalizeDateInput } from './utils/date';

type ExperienceFormValues = {
	title: string;
	company: string;
	location: string;
	from: string;
	to: string;
	current: boolean;
	description: string;
};

const initialExperienceFormValues: ExperienceFormValues = {
	title: '',
	company: '',
	location: '',
	from: '',
	to: '',
	current: false,
	description: '',
};

function ExperienceSection() {
	const dispatch = useAppDispatch();
	const {
		profile,
		status: profileStatus,
		error: profileError,
		fieldErrors: profileFieldErrors,
	} = useAppSelector((state) => state.profile);
	const {
		isModalOpen: isExperienceModalOpen,
		formValues: experienceFormValues,
		setFormValues: setExperienceFormValues,
		deletingItemId: deletingExperienceId,
		confirmingItem: confirmingExperience,
		editingItemId: editingExperienceId,
		openCreateModal,
		openEditModal,
		closeModal: closeExperienceModal,
		openDeleteConfirmation,
		closeDeleteConfirmation,
		startDeleting,
		stopDeleting,
		clearConfirmedItem,
	} = useEntrySectionController<ExperienceFormValues>({
		initialFormValues: initialExperienceFormValues,
		clearErrors: () => dispatch(clearProfileErrors()),
	});

	const experiences = profile?.experience ?? [];

	const openEditExperienceModal = (
		experience: (typeof experiences)[number],
	) => {
		const experienceId = experience._id || experience.id || null;
		openEditModal(experienceId, {
			title: experience.title ?? '',
			company: experience.company ?? '',
			location: experience.location ?? '',
			from: normalizeDateInput(experience.from),
			to: normalizeDateInput(experience.to),
			current: Boolean(experience.current),
			description: experience.description ?? '',
		});
	};

	const handleExperienceInputChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, type } = event.target;
		const value =
			type === 'checkbox'
				? (event.target as HTMLInputElement).checked
				: event.target.value;

		setExperienceFormValues((prev) => ({
			...prev,
			[name]: value,
		}));

		dispatch(clearProfileFieldError(name));

		if (name === 'current' && value === true) {
			dispatch(clearProfileFieldError('to'));
		}
	};

	const handleExperienceSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const payload = {
			title: experienceFormValues.title.trim(),
			company: experienceFormValues.company.trim(),
			location: experienceFormValues.location.trim() || undefined,
			from: experienceFormValues.from,
			to: experienceFormValues.current
				? undefined
				: experienceFormValues.to || undefined,
			current: experienceFormValues.current,
			description: experienceFormValues.description.trim() || undefined,
		};

		const actionResult = editingExperienceId
			? await dispatch(
					updateExperience({
						experienceId: editingExperienceId,
						...payload,
					}),
				)
			: await dispatch(addExperience(payload));

		if (
			addExperience.fulfilled.match(actionResult) ||
			updateExperience.fulfilled.match(actionResult)
		) {
			closeExperienceModal();
		}
	};

	const handleDeleteExperience = async () => {
		if (!confirmingExperience) return;
		const experienceId = confirmingExperience.id;
		startDeleting(experienceId);
		const result = await dispatch(deleteExperience(experienceId));
		if (deleteExperience.fulfilled.match(result)) {
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
				headerContent={<h2>Experience</h2>}
				triggerVariant="add"
				triggerAriaLabel="Add experience"
				content={
					<div className="profile-experience-list">
						{experiences.length === 0 ? (
							<p className="profile-experience-empty">Add your experience.</p>
						) : (
							experiences.map((experience) => {
								const experienceId = experience._id || experience.id || '';
								if (!experienceId) return null;

								const fromLabel = formatDateLabel(experience.from);
								const toLabel = experience.current
									? 'Present'
									: formatDateLabel(experience.to);

								return (
									<ProfileEntryItem
										key={experienceId}
										variant="experience"
										title={experience.title}
										subtitle={experience.company}
										dateText={
											(fromLabel || toLabel) && (
												<>
													{fromLabel}
													{fromLabel && toLabel ? ' - ' : ''}
													{toLabel}
												</>
											)
										}
										extraText={
											experience.location ? (
												<p className="profile-experience-location">
													{experience.location}
												</p>
											) : undefined
										}
										description={experience.description}
										onDelete={() =>
											openDeleteConfirmation(experienceId, experience.company)
										}
										onEdit={() => openEditExperienceModal(experience)}
										deleteAriaLabel={`Delete experience at ${experience.company}`}
										editAriaLabel={`Edit experience at ${experience.company}`}
									/>
								);
							})
						)}
					</div>
				}
				isModalOpen={isExperienceModalOpen}
				onOpen={openCreateModal}
				onClose={closeExperienceModal}
				modalTitle={editingExperienceId ? 'Edit experience' : 'Add experience'}
				onSubmit={handleExperienceSubmit}
				isSubmitting={profileStatus === 'loading' && !deletingExperienceId}
				errorMessage={profileError}
				submitLabel={
					editingExperienceId ? 'Update experience' : 'Add experience'
				}
				submittingLabel="Saving..."
			>
				<Input
					name="title"
					label="Job title"
					required
					value={experienceFormValues.title}
					onChange={handleExperienceInputChange}
					error={profileFieldErrors.title}
				/>
				<Input
					name="company"
					label="Company"
					required
					value={experienceFormValues.company}
					onChange={handleExperienceInputChange}
					error={profileFieldErrors.company}
				/>
				<Input
					name="location"
					label="Location"
					value={experienceFormValues.location}
					onChange={handleExperienceInputChange}
				/>
				<Input
					name="from"
					label="From"
					type="date"
					required
					value={experienceFormValues.from}
					onChange={handleExperienceInputChange}
					error={profileFieldErrors.from}
				/>
				<Input
					name="to"
					label="To"
					type="date"
					required={!experienceFormValues.current}
					value={experienceFormValues.to}
					onChange={handleExperienceInputChange}
					disabled={experienceFormValues.current}
					hint="Required unless 'I currently work here' is checked."
					error={profileFieldErrors.to}
				/>
				<label className="field profile-experience-current-field">
					<input
						type="checkbox"
						name="current"
						checked={experienceFormValues.current}
						onChange={handleExperienceInputChange}
					/>
					<span className="label">I currently work here</span>
				</label>
				<Textarea
					id="experience-description"
					label="Description"
					name="description"
					minRows={1}
					value={experienceFormValues.description}
					onChange={handleExperienceInputChange}
					error={profileFieldErrors.description}
				/>
			</EditableSection>

			<ConfirmModal
				isOpen={Boolean(confirmingExperience)}
				title="Delete experience?"
				description={
					<>
						This will remove your experience at{' '}
						<strong>{confirmingExperience?.label}</strong>.
					</>
				}
				details="This action cannot be undone."
				errorMessage={profileError}
				cancelLabel="Cancel"
				confirmLabel="Delete"
				confirmingLabel="Deleting..."
				isConfirming={Boolean(deletingExperienceId)}
				onCancel={closeDeleteConfirmation}
				onConfirm={handleDeleteExperience}
			/>
		</>
	);
}

export default ExperienceSection;
