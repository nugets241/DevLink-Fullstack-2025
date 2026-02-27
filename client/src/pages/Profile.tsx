import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getMyProfile } from '../store/slices/profileSlice';
import UserBasicsSection from '../components/profile/UserBasicsSection';
import AboutSection from '../components/profile/AboutSection';
import ExperienceSection from '../components/profile/ExperienceSection';

function Profile() {
	const dispatch = useAppDispatch();
	const { token } = useAppSelector((state) => state.auth);
	const { profile, status: profileStatus } = useAppSelector(
		(state) => state.profile,
	);

	React.useEffect(() => {
		if (token && profileStatus === 'idle') {
			dispatch(getMyProfile());
		}
	}, [dispatch, profileStatus, token]);

	if (!token) {
		return null;
	}

	if (profileStatus === 'loading' && !profile) {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading your profile...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="profile-page">
			<div className="container">
				<UserBasicsSection />
				<AboutSection />
				<ExperienceSection />
			</div>
		</div>
	);
}

export default Profile;
