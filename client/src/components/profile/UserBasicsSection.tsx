import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	clearAuthError,
	clearFieldError,
	updateUser,
} from '../../store/slices/authSlice';
import Input from '../common/Input';
import EditableSection from './EditableSection';

function UserBasicsSection() {
	const dispatch = useAppDispatch();
	const {
		user,
		status: authStatus,
		error: authError,
		fieldErrors: authFieldErrors,
	} = useAppSelector((state) => state.auth);
	const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
	const [userFormValues, setUserFormValues] = React.useState({
		name: '',
		headline: '',
		location: '',
	});

	React.useEffect(() => {
		if (!isUserModalOpen) return;
		setUserFormValues({
			name: user?.name ?? '',
			headline: user?.headline ?? '',
			location: user?.location ?? '',
		});
	}, [isUserModalOpen, user]);

	const closeUserModal = () => {
		setIsUserModalOpen(false);
		dispatch(clearAuthError());
	};

	const handleOpenUserModal = () => {
		dispatch(clearAuthError());
		setIsUserModalOpen(true);
	};

	const handleUserInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const { name, value } = event.target;

		setUserFormValues((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === 'name' || name === 'headline' || name === 'location') {
			dispatch(clearFieldError(name));
		}
	};

	const handleUserFormSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const actionResult = await dispatch(
			updateUser({
				name: userFormValues.name,
				headline: userFormValues.headline,
				location: userFormValues.location,
			}),
		);

		if (updateUser.fulfilled.match(actionResult)) {
			closeUserModal();
		}
	};

	const avatarSrc = user?.avatar?.trim() || '/devlink.svg';

	return (
		<EditableSection
			className="profile-intro card"
			headerContent={
				<img
					src={avatarSrc}
					alt="Avatar"
					className="profile-avatar"
					onError={(event) => {
						event.currentTarget.onerror = null;
						event.currentTarget.src = '/devlink.svg';
					}}
				/>
			}
			modalTitle="Edit introduction"
			isModalOpen={isUserModalOpen}
			onOpen={handleOpenUserModal}
			onClose={closeUserModal}
			onSubmit={handleUserFormSubmit}
			isSubmitting={authStatus === 'loading'}
			errorMessage={authError}
			content={
				<div className="profile-contents">
					<main>
						<h2 className="heading-xl">{user?.name ?? 'Developer'}</h2>
						{user?.headline && (
							<p className="profile-headline">{user.headline}</p>
						)}
						{user?.location && (
							<p className="profile-location">{user.location}</p>
						)}
					</main>
					<aside className="user-status"></aside>
				</div>
			}
		>
			<Input
				name="name"
				label="Name"
				value={userFormValues.name}
				onChange={handleUserInputChange}
				error={authFieldErrors.name}
			/>
			<Input
				name="headline"
				label="Headline"
				value={userFormValues.headline}
				onChange={handleUserInputChange}
				error={authFieldErrors.headline}
			/>
			<Input
				name="location"
				label="Location"
				value={userFormValues.location}
				onChange={handleUserInputChange}
				error={authFieldErrors.location}
			/>
		</EditableSection>
	);
}

export default UserBasicsSection;
