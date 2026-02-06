import Landing from './components/layout/Landing';
import Register from './pages/Register';
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
	return (
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/register" element={<Register />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
