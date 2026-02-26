import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	clearProfileError,
	upsertProfile,
} from '../../store/slices/profileSlice';
import EditableSection from './EditableSection';

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
		setAboutValue(profile?.about ?? profile?.bio ?? '');
	}, [isAboutModalOpen, profile]);

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

	const aboutText = profile?.about ?? profile?.bio;

	return (
		<EditableSection
			sectionClassName="card"
			headerClassName="profile-header"
			headerContent={<h3>About</h3>}
			content={<p>{aboutText || 'Tell the community about yourself.'}</p>}
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
					id="about-input"
					className="input"
					rows={5}
					value={aboutValue}
					onChange={(event) => setAboutValue(event.target.value)}
				/>
			</div>
		</EditableSection>
	);
}

export default AboutSection;
