import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	addEducation,
	clearProfileErrors,
	clearProfileFieldError,
	deleteEducation,
	updateEducation,
} from '../../store/slices/profileSlice';
import ConfirmModal from '../common/ConfirmModal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import EditableSection from './EditableSection';
import useEntrySectionController from './hooks/useEntrySectionController';
import ProfileEntryItem from './ProfileEntryItem';
import { formatDateLabel, normalizeDateInput } from './utils/date';

type EducationFormValues = {
	school: string;
	degree: string;
	fieldofstudy: string;
	from: string;
	to: string;
	current: boolean;
	description: string;
};

const initialEducationFormValues: EducationFormValues = {
	school: '',
	degree: '',
	fieldofstudy: '',
	from: '',
	to: '',
	current: false,
	description: '',
};

function EducationSection() {
	const dispatch = useAppDispatch();
	const {
		profile,
		status: profileStatus,
		error: profileError,
		fieldErrors: profileFieldErrors,
	} = useAppSelector((state) => state.profile);
	const {
		isModalOpen: isEducationModalOpen,
		formValues: educationFormValues,
		setFormValues: setEducationFormValues,
		deletingItemId: deletingEducationId,
		confirmingItem: confirmingEducation,
		editingItemId: editingEducationId,
		openCreateModal,
		openEditModal,
		closeModal: closeEducationModal,
		openDeleteConfirmation,
		closeDeleteConfirmation,
		startDeleting,
		stopDeleting,
		clearConfirmedItem,
	} = useEntrySectionController<EducationFormValues>({
		initialFormValues: initialEducationFormValues,
		clearErrors: () => dispatch(clearProfileErrors()),
	});

	const educationEntries = profile?.education ?? [];

	const openEditEducationModal = (
		education: (typeof educationEntries)[number],
	) => {
		const educationId = education._id || education.id || null;
		openEditModal(educationId, {
			school: education.school ?? '',
			degree: education.degree ?? '',
			fieldofstudy: education.fieldofstudy ?? '',
			from: normalizeDateInput(education.from),
			to: normalizeDateInput(education.to),
			current: Boolean(education.current),
			description: education.description ?? '',
		});
	};

	const handleEducationInputChange = (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, type } = event.target;
		const value =
			type === 'checkbox'
				? (event.target as HTMLInputElement).checked
				: event.target.value;

		setEducationFormValues((prev) => ({
			...prev,
			[name]: value,
		}));

		dispatch(clearProfileFieldError(name));

		if (name === 'current' && value === true) {
			dispatch(clearProfileFieldError('to'));
		}
	};

	const handleEducationSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const payload = {
			school: educationFormValues.school.trim(),
			degree: educationFormValues.degree.trim(),
			fieldofstudy: educationFormValues.fieldofstudy.trim(),
			from: educationFormValues.from,
			to: educationFormValues.current
				? undefined
				: educationFormValues.to || undefined,
			current: educationFormValues.current,
			description: educationFormValues.description.trim() || undefined,
		};

		const actionResult = editingEducationId
			? await dispatch(
					updateEducation({
						educationId: editingEducationId,
						...payload,
					}),
				)
			: await dispatch(addEducation(payload));

		if (
			addEducation.fulfilled.match(actionResult) ||
			updateEducation.fulfilled.match(actionResult)
		) {
			closeEducationModal();
		}
	};

	const handleDeleteEducation = async () => {
		if (!confirmingEducation) return;
		const educationId = confirmingEducation.id;
		startDeleting(educationId);
		const result = await dispatch(deleteEducation(educationId));
		if (deleteEducation.fulfilled.match(result)) {
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
				headerContent={<h2>Education</h2>}
				triggerVariant="add"
				triggerAriaLabel="Add education"
				content={
					<div className="education-list">
						{educationEntries.length === 0 ? (
							<p className="education-empty">Add your education history.</p>
						) : (
							educationEntries.map((education) => {
								const educationId = education._id || education.id || '';
								if (!educationId) return null;

								const fromLabel = formatDateLabel(education.from);
								const toLabel = education.current
									? 'Present'
									: formatDateLabel(education.to);

								return (
									<ProfileEntryItem
										key={educationId}
										variant="education"
										title={education.school}
										subtitle={
											<>
												{education.degree}
												{education.fieldofstudy
													? `, ${education.fieldofstudy}`
													: ''}
											</>
										}
										dateText={
											(fromLabel || toLabel) && (
												<>
													{fromLabel}
													{fromLabel && toLabel ? ' - ' : ''}
													{toLabel}
												</>
											)
										}
										description={education.description}
										onDelete={() =>
											openDeleteConfirmation(educationId, education.school)
										}
										onEdit={() => openEditEducationModal(education)}
										deleteAriaLabel={`Delete education at ${education.school}`}
										editAriaLabel={`Edit education at ${education.school}`}
									/>
								);
							})
						)}
					</div>
				}
				isModalOpen={isEducationModalOpen}
				onOpen={openCreateModal}
				onClose={closeEducationModal}
				modalTitle={editingEducationId ? 'Edit education' : 'Add education'}
				onSubmit={handleEducationSubmit}
				isSubmitting={profileStatus === 'loading' && !deletingEducationId}
				errorMessage={profileError}
				submitLabel={editingEducationId ? 'Update education' : 'Add education'}
				submittingLabel="Saving..."
			>
				<Input
					name="school"
					label="School"
					required
					value={educationFormValues.school}
					onChange={handleEducationInputChange}
					error={profileFieldErrors.school}
				/>
				<Input
					name="degree"
					label="Degree"
					required
					value={educationFormValues.degree}
					onChange={handleEducationInputChange}
					error={profileFieldErrors.degree}
				/>
				<Input
					name="fieldofstudy"
					label="Field of study"
					required
					value={educationFormValues.fieldofstudy}
					onChange={handleEducationInputChange}
					error={profileFieldErrors.fieldofstudy}
				/>
				<Input
					name="from"
					label="From"
					type="date"
					required
					value={educationFormValues.from}
					onChange={handleEducationInputChange}
					error={profileFieldErrors.from}
				/>
				<Input
					name="to"
					label="To"
					type="date"
					required={!educationFormValues.current}
					value={educationFormValues.to}
					onChange={handleEducationInputChange}
					disabled={educationFormValues.current}
					hint="Required unless 'I currently study here' is checked."
					error={profileFieldErrors.to}
				/>
				<label className="field education-current-field">
					<input
						type="checkbox"
						name="current"
						checked={educationFormValues.current}
						onChange={handleEducationInputChange}
					/>
					<span className="label">I currently study here</span>
				</label>
				<Textarea
					id="education-description"
					label="Description"
					name="description"
					minRows={1}
					value={educationFormValues.description}
					onChange={handleEducationInputChange}
					error={profileFieldErrors.description}
				/>
			</EditableSection>

			<ConfirmModal
				isOpen={Boolean(confirmingEducation)}
				title="Delete education?"
				description={
					<>
						This will remove your education at{' '}
						<strong>{confirmingEducation?.label}</strong>.
					</>
				}
				details="This action cannot be undone."
				errorMessage={profileError}
				cancelLabel="Cancel"
				confirmLabel="Delete"
				confirmingLabel="Deleting..."
				isConfirming={Boolean(deletingEducationId)}
				onCancel={closeDeleteConfirmation}
				onConfirm={handleDeleteEducation}
			/>
		</>
	);
}

export default EducationSection;
