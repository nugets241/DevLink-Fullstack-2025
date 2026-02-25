import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
	clearProfileError,
	clearProfileFieldError,
	getMyProfile,
	upsertProfile,
} from '../store/slices/profileSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const EMPTY_SOCIAL = {
	youtube: '',
	x: '',
	facebook: '',
	linkedin: '',
	instagram: '',
	github: '',
};

function Profile() {
	const dispatch = useAppDispatch();
	const { token, user } = useAppSelector((state) => state.auth);
	const { profile, status, error, fieldErrors } = useAppSelector(
		(state) => state.profile,
	);
	const [isEditing, setIsEditing] = React.useState(false);
	const [formValues, setFormValues] = React.useState({
		status: '',
		company: '',
		location: '',
		website: '',
		bio: '',
		skills: '',
		social: { ...EMPTY_SOCIAL },
	});

	React.useEffect(() => {
		if (token && status === 'idle') {
			dispatch(getMyProfile());
		}
	}, [dispatch, status, token]);

	React.useEffect(() => {
		if (!profile) return;
		setFormValues({
			status: profile.status ?? '',
			company: profile.company ?? '',
			location: profile.location ?? '',
			website: profile.website ?? '',
			bio: profile.bio ?? '',
			skills: profile.skills?.join(', ') ?? '',
			social: { ...EMPTY_SOCIAL, ...(profile.social ?? {}) },
		});
	}, [profile]);

	if (!token) {
		return null;
	}

	const profileStatus = profile?.status || 'Not set';
	const profileSkills = profile?.skills?.length
		? profile.skills.join(', ')
		: 'No skills added yet.';

	if (status === 'loading' && !profile) {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading your profile...</p>
				</div>
			</div>
		);
	}

	const avatarSrc = user?.avatar?.trim() || '/devlink.svg';

	return (
		<div className="profile-page">
			<div className="container">
				<section className="profile-header card">
					<img
						src={avatarSrc}
						alt="Avatar"
						className="profile-avatar"
						onError={(event) => {
							event.currentTarget.onerror = null;
							event.currentTarget.src = '/devlink.svg';
						}}
					/>
					<h2>{user?.name ?? 'Developer'}</h2>
					{user?.headline && (
						<p className="profile-headline">{user.headline}</p>
					)}
					{user?.location && (
						<p className="profile-location">{user.location}</p>
					)}
				</section>

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
