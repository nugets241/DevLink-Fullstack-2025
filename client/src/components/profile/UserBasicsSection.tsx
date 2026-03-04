import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	clearAuthErrors,
	clearFieldError,
	updateUser,
} from '../../store/slices/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import ContactInfoSection from './ContactInfoSection';
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
	const [isContactInfoModalOpen, setIsContactInfoModalOpen] =
		React.useState(false);
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
		dispatch(clearAuthErrors());
	};

	const handleOpenUserModal = () => {
		dispatch(clearAuthErrors());
		setIsUserModalOpen(true);
	};

	const openContactInfoModal = () => {
		setIsContactInfoModalOpen(true);
	};

	const closeContactInfoModal = () => {
		setIsContactInfoModalOpen(false);
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
		<>
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
					<>
						<main>
							<h2 className="heading-xl">{user?.name ?? 'Developer'}</h2>
							<p className="profile-headline">
								{user?.headline || 'Add a headline'}
							</p>
						</main>
						<button
							type="button"
							onClick={openContactInfoModal}
							className="contact-info-trigger"
						>
							Contact info
						</button>
						<p className="profile-location">
							{user?.location || 'Add your location'}
						</p>
					</>
				}
			>
				<Input
					name="name"
					label="Name"
					required
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

			<Modal isOpen={isContactInfoModalOpen} preventClose>
				<div className="profile-contact-modal">
					<div className="profile-modal-header">
						<h2>{user?.name}</h2>
						<Button
							type="button"
							variant="icon"
							onClick={closeContactInfoModal}
							aria-label="Close contact info"
						>
							<MdOutlineClose aria-hidden="true" focusable="false" />
						</Button>
					</div>
					<div className="profile-contact-modal-body">
						<ContactInfoSection />
					</div>
				</div>
			</Modal>
		</>
	);
}

export default UserBasicsSection;
