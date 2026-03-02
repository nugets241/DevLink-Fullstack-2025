import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getMyProfile } from '../store/slices/profileSlice';
import UserBasicsSection from '../components/profile/UserBasicsSection';
import AboutSection from '../components/profile/AboutSection';
import ExperienceSection from '../components/profile/ExperienceSection';
import EducationSection from '../components/profile/EducationSection';
import SkillsSection from '../components/profile/SkillsSection';

function Profile() {
	const dispatch = useAppDispatch();
	const { token } = useAppSelector((state) => state.auth);
	const { profile, status: profileStatus } = useAppSelector(
		(state) => state.profile,
	);
	const [isProfileBootstrapComplete, setIsProfileBootstrapComplete] =
		React.useState(false);

	React.useEffect(() => {
		let isMounted = true;

		if (!token) {
			setIsProfileBootstrapComplete(true);
			return () => {
				isMounted = false;
			};
		}

		setIsProfileBootstrapComplete(false);
		dispatch(getMyProfile()).finally(() => {
			if (!isMounted) return;
			setIsProfileBootstrapComplete(true);
		});

		return () => {
			isMounted = false;
		};
	}, [dispatch, token]);

	if (!token) {
		return null;
	}

	if (
		!isProfileBootstrapComplete ||
		(profileStatus === 'loading' && !profile)
	) {
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
				<EducationSection />
				<SkillsSection />
			</div>
		</div>
	);
}

export default Profile;
