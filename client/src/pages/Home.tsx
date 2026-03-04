import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getUserData } from '../store/slices/authSlice';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

function Home() {
	const dispatch = useAppDispatch();
	const { user, token, status, error } = useAppSelector((state) => state.auth);

	if (!token) {
		return null;
	}

	if (status === 'loading') {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading your profile...</p>
				</div>
			</div>
		);
	}

	if (status === 'failed' && !user) {
		return (
			<div className="container">
				<div className="loading-modal">
					<p>{error ?? 'Could not load your profile.'}</p>
					<Button
						type="button"
						variant="primary"
						onClick={() => dispatch(getUserData())}
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Preparing your home page...</p>
				</div>
			</div>
		);
	}

	const avatarSrc = user.avatar?.trim() || '/devlink.svg';

	return (
		<div className="container">
			<div className="home-layout">
				<aside className="card">
					<Link to="/profile" aria-label="Go to your profile">
						<img
							src={avatarSrc}
							alt="Avatar"
							className="profile-avatar"
							onError={(event) => {
								event.currentTarget.onerror = null;
								event.currentTarget.src = '/devlink.svg';
							}}
						/>
					</Link>
					<h2>{user.name}</h2>
					<p className="profile-headline">
						{user?.headline || 'Add a headline'}
					</p>
					<p className="profile-location">
						{user?.location || 'Add your location'}
					</p>
				</aside>
				<main className="card">
					<h2>Posts</h2>
					<p className="posts-empty">No posts yet.</p>
				</main>
			</div>
		</div>
	);
}

export default Home;
