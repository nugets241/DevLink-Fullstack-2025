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
				<Link to="/">
					<img src="/favicon.svg" alt="DevLink Logo" className="navbar-logo" />
				</Link>
				{token && user && (
					<div className="navbar-menu">
						<Link className="navbar-link" to="/people">
							People
						</Link>
						<Link className="navbar-link" to="/profile">
							Profile
						</Link>
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
