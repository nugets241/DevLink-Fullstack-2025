import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import React from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getUserData } from './store/slices/authSlice';

type ProfileByIdRouteProps = {
	token: string | null;
	currentUserId?: string;
};

function ProfileByIdRoute({ token, currentUserId }: ProfileByIdRouteProps) {
	const { userId } = useParams<{ userId: string }>();

	if (!userId) {
		return <Navigate to="/" replace />;
	}

	if (token && currentUserId && userId === currentUserId) {
		return <Profile />;
	}

	return <UserProfile />;
}

function LegacyProfileByIdRedirect() {
	const { userId } = useParams<{ userId: string }>();

	if (!userId) {
		return <Navigate to="/" replace />;
	}

	return <Navigate to={`/profiles/${userId}`} replace />;
}

function App() {
	const dispatch = useAppDispatch();
	const { token, user } = useAppSelector((state) => state.auth);
	const currentUserId =
		user?.id ?? (user as ({ _id?: string } & typeof user) | null)?._id;
	const [isAuthBootstrapComplete, setIsAuthBootstrapComplete] =
		React.useState(false);

	React.useEffect(() => {
		let isMounted = true;

		if (!token) {
			setIsAuthBootstrapComplete(true);
			return () => {
				isMounted = false;
			};
		}

		setIsAuthBootstrapComplete(false);
		dispatch(getUserData()).finally(() => {
			if (!isMounted) return;
			setIsAuthBootstrapComplete(true);
		});

		return () => {
			isMounted = false;
		};
	}, [dispatch, token]);

	if (token && !isAuthBootstrapComplete) {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading your account...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{token && <Navbar />}
			<Routes>
				<Route path="/" element={token ? <Home /> : <Landing />} />
				<Route path="/register" element={<Register />} />
				<Route
					path="/profiles/:userId"
					element={
						<ProfileByIdRoute token={token} currentUserId={currentUserId} />
					}
				/>
				<Route
					path="/profile/:userId"
					element={<LegacyProfileByIdRedirect />}
				/>
				<Route
					path="/profile"
					element={
						token ? (
							currentUserId ? (
								<Navigate to={`/profiles/${currentUserId}`} replace />
							) : (
								<Profile />
							)
						) : (
							<Navigate to="/" replace />
						)
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	);
}

export default App;
