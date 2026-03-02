import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getUserData } from './store/slices/authSlice';

function App() {
	const dispatch = useAppDispatch();
	const { token } = useAppSelector((state) => state.auth);
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
					path="/profile"
					element={token ? <Profile /> : <Navigate to="/" replace />}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	);
}

export default App;
