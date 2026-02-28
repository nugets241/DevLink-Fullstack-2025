import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	addExperience,
	clearProfileError,
	clearProfileFieldError,
	deleteExperience,
	updateExperience,
} from '../../store/slices/profileSlice';
import Input from '../common/Input';
import Button from '../common/Button';
import EditableSection from './EditableSection';
import { LuPencil, LuX } from 'react-icons/lu';

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

function normalizeDateInput(value?: string) {
	if (!value) return '';
	return value.slice(0, 10);
}

function formatDateLabel(value?: string) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
	});
}

function ExperienceSection() {
	const dispatch = useAppDispatch();
	const {
		profile,
		status: profileStatus,
		error: profileError,
		fieldErrors: profileFieldErrors,
	} = useAppSelector((state) => state.profile);

	const [isExperienceModalOpen, setIsExperienceModalOpen] =
		React.useState(false);
	const [experienceFormValues, setExperienceFormValues] =
		React.useState<ExperienceFormValues>(initialExperienceFormValues);
	const [deletingExperienceId, setDeletingExperienceId] = React.useState<
		string | null
	>(null);
	const [editingExperienceId, setEditingExperienceId] = React.useState<
		string | null
	>(null);

	const experiences = profile?.experience ?? [];

	const openExperienceModal = () => {
		dispatch(clearProfileError());
		setEditingExperienceId(null);
		setExperienceFormValues(initialExperienceFormValues);
		setIsExperienceModalOpen(true);
	};

	const openEditExperienceModal = (
		experience: (typeof experiences)[number],
	) => {
		const experienceId = experience._id || experience.id || null;
		if (!experienceId) return;

		dispatch(clearProfileError());
		setEditingExperienceId(experienceId);
		setExperienceFormValues({
			title: experience.title ?? '',
			company: experience.company ?? '',
			location: experience.location ?? '',
			from: normalizeDateInput(experience.from),
			to: normalizeDateInput(experience.to),
			current: Boolean(experience.current),
			description: experience.description ?? '',
		});
		setIsExperienceModalOpen(true);
	};

	const closeExperienceModal = () => {
		setIsExperienceModalOpen(false);
		setEditingExperienceId(null);
		dispatch(clearProfileError());
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

	const handleDeleteExperience = async (experienceId: string) => {
		setDeletingExperienceId(experienceId);
		const result = await dispatch(deleteExperience(experienceId));
		if (deleteExperience.fulfilled.match(result)) {
			setDeletingExperienceId(null);
			return;
		}
		setDeletingExperienceId(null);
	};

	return (
		<EditableSection
			className="card"
			headerContent={<h2>Experience</h2>}
			triggerVariant="add"
			triggerAriaLabel="Add experience"
			content={
				<div className="experience-list">
					{experiences.length === 0 ? (
						<p className="experience-empty">Add your experience experience.</p>
					) : (
						experiences.map((experience) => {
							const experienceId = experience._id || experience.id || '';
							if (!experienceId) return null;

							const fromLabel = formatDateLabel(experience.from);
							const toLabel = experience.current
								? 'Present'
								: formatDateLabel(experience.to);

							return (
								<article key={experienceId} className="experience-item">
									<div className="experience-item-header">
										<div>
											<h3>{experience.title}</h3>
											<p>{experience.company}</p>
											{(fromLabel || toLabel) && (
												<p className="experience-dates">
													{fromLabel}
													{fromLabel && toLabel ? ' - ' : ''}
													{toLabel}
												</p>
											)}
											{experience.location && <p>{experience.location}</p>}
										</div>
										<div>
											<button
												type="button"
												className="profile-icon-button"
												onClick={() => handleDeleteExperience(experienceId)}
												aria-label={`Delete experience at ${experience.company}`}
											>
												<LuX aria-hidden="true" focusable="false" />
											</button>
											<button
												type="button"
												className="profile-icon-button"
												onClick={() => openEditExperienceModal(experience)}
												aria-label={`Edit experience at ${experience.company}`}
											>
												<LuPencil aria-hidden="true" focusable="false" />
											</button>
										</div>
									</div>
									{experience.description && (
										<p className="experience-description">
											{experience.description}
										</p>
									)}
								</article>
							);
						})
					)}
				</div>
			}
			isModalOpen={isExperienceModalOpen}
			onOpen={openExperienceModal}
			onClose={closeExperienceModal}
			modalTitle={editingExperienceId ? 'Edit experience' : 'Add experience'}
			onSubmit={handleExperienceSubmit}
			isSubmitting={profileStatus === 'loading' && !deletingExperienceId}
			errorMessage={profileError}
			submitLabel={editingExperienceId ? 'Update experience' : 'Add experience'}
			submittingLabel="Saving..."
		>
			<Input
				name="title"
				label="Job title"
				value={experienceFormValues.title}
				onChange={handleExperienceInputChange}
				error={profileFieldErrors.title}
			/>
			<Input
				name="company"
				label="Company"
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
				value={experienceFormValues.from}
				onChange={handleExperienceInputChange}
				error={profileFieldErrors.from}
			/>
			<Input
				name="to"
				label="To"
				type="date"
				value={experienceFormValues.to}
				onChange={handleExperienceInputChange}
				disabled={experienceFormValues.current}
				error={profileFieldErrors.to}
			/>
			<label className="field experience-current-field">
				<input
					type="checkbox"
					name="current"
					checked={experienceFormValues.current}
					onChange={handleExperienceInputChange}
				/>
				<span className="label">I currently work here</span>
			</label>
			<div className="field">
				<label className="label" htmlFor="experience-description">
					Description
				</label>
				<textarea
					id="experience-description"
					className="input"
					name="description"
					rows={4}
					value={experienceFormValues.description}
					onChange={handleExperienceInputChange}
				/>
			</div>
		</EditableSection>
	);
}

export default ExperienceSection;
