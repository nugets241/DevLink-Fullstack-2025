import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	clearProfileError,
	upsertProfile,
} from '../../store/slices/profileSlice';
import EditableSection from './EditableSection';

function AboutSection() {
	const dispatch = useAppDispatch();
	const aboutTextareaRef = React.useRef<HTMLTextAreaElement>(null);
	const {
		profile,
		status: profileStatus,
		error: profileError,
	} = useAppSelector((state) => state.profile);
	const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);
	const [aboutValue, setAboutValue] = React.useState('');

	const resizeAboutTextarea = (textarea: HTMLTextAreaElement) => {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	React.useEffect(() => {
		if (!isAboutModalOpen) return;
		setAboutValue(profile?.about || '');
	}, [isAboutModalOpen, profile]);

	React.useEffect(() => {
		const textarea = aboutTextareaRef.current;
		if (!textarea) return;
		resizeAboutTextarea(textarea);
	}, [aboutValue, isAboutModalOpen]);

	const handleAboutChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setAboutValue(event.target.value);
		resizeAboutTextarea(event.currentTarget);
	};

	const closeAboutModal = () => {
		setIsAboutModalOpen(false);
		dispatch(clearProfileError());
	};

	const handleOpenAboutModal = () => {
		dispatch(clearProfileError());
		setIsAboutModalOpen(true);
	};

	const handleAboutSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const actionResult = await dispatch(
			upsertProfile({
				status: profile?.status?.trim() || 'Developer',
				skills: profile?.skills?.length ? profile.skills : ['General'],
				about: aboutValue.trim(),
				company: profile?.company,
				website: profile?.website,
				location: profile?.location,
				social: profile?.social,
			}),
		);

		if (upsertProfile.fulfilled.match(actionResult)) {
			closeAboutModal();
		}
	};

	const aboutText = profile?.about;

	return (
		<EditableSection
			className="card"
			headerContent={<h2>About</h2>}
			content={
				<p className="profile-about-text">
					{aboutText || 'Tell the community about yourself.'}
				</p>
			}
			isModalOpen={isAboutModalOpen}
			onOpen={handleOpenAboutModal}
			onClose={closeAboutModal}
			modalTitle="Update about"
			onSubmit={handleAboutSubmit}
			isSubmitting={profileStatus === 'loading'}
			errorMessage={profileError}
		>
			<div className="field">
				<label className="label" htmlFor="about-input">
					About
				</label>
				<textarea
					ref={aboutTextareaRef}
					id="about-input"
					className="input profile-about-textarea"
					rows={5}
					value={aboutValue}
					onChange={handleAboutChange}
				/>
			</div>
		</EditableSection>
	);
}

export default AboutSection;
