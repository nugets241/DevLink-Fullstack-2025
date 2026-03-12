import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { API_ENDPOINTS } from '../config/api';
import { useAppSelector } from '../store/hooks';

type ProfileListUser = {
	id?: string;
	_id?: string;
	name?: string;
	avatar?: string;
	headline?: string;
};

type ProfileListItem = {
	_id?: string;
	user?: ProfileListUser;
	location?: string;
};

function People() {
	const { user, token } = useAppSelector((state) => state.auth);
	const currentUserId =
		user?.id ?? (user as ({ _id?: string } & typeof user) | null)?._id;
	const [profiles, setProfiles] = React.useState<ProfileListItem[]>([]);
	const [status, setStatus] = React.useState<
		'idle' | 'loading' | 'succeeded' | 'failed'
	>('idle');
	const [error, setError] = React.useState<string | null>(null);

	const loadProfiles = React.useCallback(async () => {
		setStatus('loading');
		setError(null);

		try {
			const response = await fetch(API_ENDPOINTS.profile, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.msg ?? 'Failed to load people.');
			}

			const data = (await response.json()) as ProfileListItem[];
			setProfiles(data);
			setStatus('succeeded');
		} catch (fetchError) {
			console.error(fetchError);
			setStatus('failed');
			setError('Could not load people right now.');
		}
	}, []);

	React.useEffect(() => {
		if (!token) return;
		loadProfiles();
	}, [loadProfiles, token]);

	if (!token) {
		return null;
	}

	if (status === 'loading') {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading people...</p>
				</div>
			</div>
		);
	}

	if (status === 'failed') {
		return (
			<div className="container">
				<div className="loading-modal">
					<p>{error ?? 'Failed to load people.'}</p>
					<Button type="button" variant="primary" onClick={loadProfiles}>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	const visibleProfiles = profiles.filter((profile) => {
		const profileUserId = profile.user?._id ?? profile.user?.id;
		if (!profileUserId) return false;
		return profileUserId !== currentUserId;
	});

	return (
		<div className="container people-page">
			{visibleProfiles.length === 0 ? (
				<p className="people-empty">No other users found yet.</p>
			) : (
				<div className="people-grid">
					{visibleProfiles.map((profile) => {
						const profileUserId = profile.user?._id ?? profile.user?.id;
						if (!profileUserId) return null;

						const avatarSrc = profile.user?.avatar?.trim() || '/devlink.svg';

						return (
							<Link
								to={`/profiles/${profileUserId}`}
								className="people-card card"
								key={profileUserId}
							>
								<img
									src={avatarSrc}
									alt={`${profile.user?.name ?? 'User'} avatar`}
									className="people-avatar"
									onError={(event) => {
										event.currentTarget.onerror = null;
										event.currentTarget.src = '/devlink.svg';
									}}
								/>
								<div className="people-info">
									<h2>{profile.user?.name ?? 'Developer'}</h2>
									<p className="people-headline">
										{profile.user?.headline || 'No headline added yet.'}
									</p>
									<p className="people-location">
										{profile.location || 'Location not provided'}
									</p>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default People;
