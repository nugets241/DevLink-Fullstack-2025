import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Button from '../common/Button';
import { LuHouse, LuUser, LuUsers } from 'react-icons/lu';

function Navbar() {
	const dispatch = useAppDispatch();
	const location = useLocation();
	const navigate = useNavigate();
	const { user, token } = useAppSelector((state) => state.auth);
	const currentUserId =
		user?.id ?? (user as ({ _id?: string } & typeof user) | null)?._id;
	const profileHref = currentUserId ? `/profiles/${currentUserId}` : '/profile';
	const isProfileRoute =
		location.pathname.startsWith('/profiles/') ||
		location.pathname.startsWith('/profile');

	const getNavLinkClassName = (isActive: boolean) =>
		`navbar-link navbar-icon-link${isActive ? ' is-active' : ''}`;

	const handleLogout = () => {
		dispatch(logout());
		navigate('/', { replace: true });
	};

	return (
		<nav className="navbar">
			<div className="navbar-container">
				<Link to="/" className="navbar-brand">
					<img src="/favicon.svg" alt="DevLink Logo" className="navbar-logo" />
				</Link>
				{token && user && (
					<>
						<div className="navbar-links">
							<NavLink
								to="/"
								end
								className={({ isActive }) => getNavLinkClassName(isActive)}
								aria-label="Home"
								title="Home"
							>
								<LuHouse aria-hidden="true" focusable="false" />
								<span className="navbar-link-label">Home</span>
							</NavLink>
							<NavLink
								to="/people"
								className={({ isActive }) => getNavLinkClassName(isActive)}
								aria-label="People"
								title="People"
							>
								<LuUsers aria-hidden="true" focusable="false" />
								<span className="navbar-link-label">People</span>
							</NavLink>
						</div>
						<div className="navbar-actions">
							<Button variant="primary" onClick={handleLogout}>
								Logout
							</Button>
						</div>
					</>
				)}
			</div>
		</nav>
	);
}

export default Navbar;
