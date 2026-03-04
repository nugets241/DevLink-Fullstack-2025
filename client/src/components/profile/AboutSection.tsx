import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	clearProfileErrors,
	upsertProfile,
} from '../../store/slices/profileSlice';
import EditableSection from './EditableSection';
import Textarea from '../common/Textarea';

function AboutSection() {
	const dispatch = useAppDispatch();
	const {
		profile,
		status: profileStatus,
		error: profileError,
	} = useAppSelector((state) => state.profile);
	const [isAboutModalOpen, setIsAboutModalOpen] = React.useState(false);
	const [aboutValue, setAboutValue] = React.useState('');

	React.useEffect(() => {
		if (!isAboutModalOpen) return;
		setAboutValue(profile?.about || '');
	}, [isAboutModalOpen, profile]);

	const handleAboutChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setAboutValue(event.target.value);
	};

	const closeAboutModal = () => {
		setIsAboutModalOpen(false);
		dispatch(clearProfileErrors());
	};

	const handleOpenAboutModal = () => {
		dispatch(clearProfileErrors());
		setIsAboutModalOpen(true);
	};

	const handleAboutSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const actionResult = await dispatch(
			upsertProfile({
				status: profile?.status?.trim() || 'Developer',
				skills: profile?.skills,
				about: aboutValue.trim(),
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
			<Textarea
				id="about-input"
				label="About"
				className="profile-about-textarea"
				name="about"
				minRows={1}
				value={aboutValue}
				onChange={handleAboutChange}
			/>
		</EditableSection>
	);
}

export default AboutSection;
