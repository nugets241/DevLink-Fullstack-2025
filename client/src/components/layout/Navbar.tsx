import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Button from '../common/Button';

function Navbar() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { user, token } = useAppSelector((state) => state.auth);

	const handleLogout = () => {
		dispatch(logout());
		navigate('/', { replace: true });
	};

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<Link to="/" className="navbar-brand">
					<h1>DevLink</h1>
				</Link>
				{token && user && (
					<div className="navbar-menu">
						<span className="navbar-user">Hello, {user.name}</span>
						<Button variant="primary" onClick={handleLogout}>
							Logout
						</Button>
					</div>
				)}
			</div>
		</nav>
	);
}

export default Navbar;
