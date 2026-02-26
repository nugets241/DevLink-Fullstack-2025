import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getMyProfile } from '../store/slices/profileSlice';
import UserBasicsSection from '../components/profile/UserBasicsSection';

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

				{/* <div className="card">
					<h3>Status</h3>
					<p>{profileStatus}</p>
					<p className="profile-meta">
						{profile?.company || 'Company not added'}
					</p>
					<p className="profile-meta">
						{profile?.location || 'Location not added'}
					</p>
					{profile?.website ? (
						<a href={profile.website} target="_blank" rel="noreferrer">
							{profile.website}
						</a>
					) : (
						<p className="profile-meta">Website not added</p>
					)}
				</div>

				<div className="card">
					<h3>About</h3>
					<p>{profile?.bio || 'Tell the community about yourself.'}</p>
				</div>
				<div className="card">
					<h3>Skills</h3>
					<p>{profileSkills}</p>
				</div>
				<div className="card">
					<h3>Social</h3>
					<ul className="profile-links">
						<li>
							<span>LinkedIn</span>
							{profile?.social?.linkedin ? (
								<a
									href={profile.social.linkedin}
									target="_blank"
									rel="noreferrer"
								>
									Visit
								</a>
							) : (
								<span className="profile-meta">Not added</span>
							)}
						</li>
						<li>
							<span>GitHub</span>
							{profile?.social?.github ? (
								<a
									href={profile.social.github}
									target="_blank"
									rel="noreferrer"
								>
									Visit
								</a>
							) : (
								<span className="profile-meta">Not added</span>
							)}
						</li>
						<li>
							<span>X</span>
							{profile?.social?.x ? (
								<a href={profile.social.x} target="_blank" rel="noreferrer">
									Visit
								</a>
							) : (
								<span className="profile-meta">Not added</span>
							)}
						</li>
						<li>
							<span>YouTube</span>
							{profile?.social?.youtube ? (
								<a
									href={profile.social.youtube}
									target="_blank"
									rel="noreferrer"
								>
									Visit
								</a>
							) : (
								<span className="profile-meta">Not added</span>
							)}
						</li>
						<li>
							<span>Facebook</span>
							{profile?.social?.facebook ? (
								<a
									href={profile.social.facebook}
									target="_blank"
									rel="noreferrer"
								>
									Visit
								</a>
							) : (
								<span className="profile-meta">Not added</span>
							)}
						</li>
						<li>
							<span>Instagram</span>
							{profile?.social?.instagram ? (
								<a
									href={profile.social.instagram}
									target="_blank"
									rel="noreferrer"
								>
									Visit
								</a>
							) : (
								<span className="profile-meta">Not added</span>
							)}
						</li>
					</ul>
				</div> */}
			</div>
		</div>
	);
}

export default Profile;
