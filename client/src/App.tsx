import Landing from './components/layout/Landing';
import Navbar from './components/layout/Navbar';
import Register from './pages/Register';
import Home from './pages/Home';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAppSelector } from './store/hooks';

function App() {
	const { token } = useAppSelector((state) => state.auth);

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
