import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import Register from './pages/Register';
import Home from './pages/Home';
import { Navigate, Route, Routes } from 'react-router-dom';
import React from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getUserData } from './store/slices/authSlice';

function App() {
	const dispatch = useAppDispatch();
	const { token, user, status } = useAppSelector((state) => state.auth);

	React.useEffect(() => {
		if (token && !user && status === 'idle') {
			dispatch(getUserData());
		}
	}, [token, user, status, dispatch]);

	return (
		<>
			{token && <Navbar />}
			<Routes>
				<Route path="/" element={token ? <Home /> : <Landing />} />
				<Route path="/register" element={<Register />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</>
	);
}

export default App;
