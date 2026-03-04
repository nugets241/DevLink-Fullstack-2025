import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import Button from '../common/Button';
import { LuHouse, LuUsers } from 'react-icons/lu';

function Navbar() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { user, token } = useAppSelector((state) => state.auth);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement | null>(null);
	const currentUserId =
		user?.id ?? (user as ({ _id?: string } & typeof user) | null)?._id;
	const profileHref = currentUserId ? `/profiles/${currentUserId}` : '/profile';

	const getNavLinkClassName = (isActive: boolean) =>
		`navbar-link navbar-icon-link${isActive ? ' is-active' : ''}`;

	useEffect(() => {
		if (!isUserMenuOpen) return;

		const handlePointerDown = (event: MouseEvent) => {
			if (!userMenuRef.current) return;
			if (userMenuRef.current.contains(event.target as Node)) return;
			setIsUserMenuOpen(false);
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setIsUserMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handlePointerDown);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('mousedown', handlePointerDown);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isUserMenuOpen]);

	const handleLogout = () => {
		setIsUserMenuOpen(false);
		dispatch(logout());
		navigate('/', { replace: true });
	};

	const handleVisitProfile = () => {
		setIsUserMenuOpen(false);
		navigate(profileHref);
	};

	const avatarSrc = user?.avatar?.trim() || '/devlink.svg';

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
							<div className="navbar-user-menu" ref={userMenuRef}>
								<button
									type="button"
									className="navbar-avatar-trigger"
									onClick={() => setIsUserMenuOpen((prev) => !prev)}
									aria-label="Open user menu"
									aria-haspopup="menu"
									aria-expanded={isUserMenuOpen}
								>
									<img
										src={avatarSrc}
										alt="User avatar"
										className="navbar-avatar-image"
										onError={(event) => {
											event.currentTarget.onerror = null;
											event.currentTarget.src = '/devlink.svg';
										}}
									/>
								</button>

								{isUserMenuOpen && (
									<div className="navbar-dropdown" role="menu">
										<div className="navbar-dropdown-user">
											<img
												src={avatarSrc}
												alt="User avatar"
												className="navbar-dropdown-avatar"
												onError={(event) => {
													event.currentTarget.onerror = null;
													event.currentTarget.src = '/devlink.svg';
												}}
											/>
											<div>
												<p className="navbar-dropdown-name">{user.name}</p>
												<p className="navbar-dropdown-headline">
													{user.headline || 'No headline added yet.'}
												</p>
											</div>
										</div>

										<div className="navbar-dropdown-actions">
											<Button variant="primary" onClick={handleVisitProfile}>
												View profile
											</Button>
											<Button variant="tertiary" onClick={handleLogout}>
												Log out
											</Button>
										</div>
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</nav>
	);
}

export default Navbar;
