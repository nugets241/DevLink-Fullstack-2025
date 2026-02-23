import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getUserData } from '../store/slices/authSlice';

function Home() {
	const dispatch = useAppDispatch();
	const { user, token, status } = useAppSelector((state) => state.auth);

	React.useEffect(() => {
		if (token && !user) {
			dispatch(getUserData());
		}
	}, [token, user, dispatch]);

	if (!token) {
		return null;
	}

	if (status === 'loading' || !user) {
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
		<div className="container">
			<h1>Welcome, {user.name}!</h1>
			<div>
				<h2>Your Profile</h2>
				<p>Email: {user.email}</p>
				{user.avatar && <img src={user.avatar} alt="Avatar" />}
			</div>
		</div>
	);
}

export default Home;
