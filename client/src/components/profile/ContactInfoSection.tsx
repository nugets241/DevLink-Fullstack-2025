import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	clearProfileErrors,
	clearProfileFieldError,
	upsertProfile,
} from '../../store/slices/profileSlice';
import EditableSection from './EditableSection';
import Input from '../common/Input';

type ContactFormValues = {
	website: string;
	linkedin: string;
	github: string;
	x: string;
	facebook: string;
	youtube: string;
	instagram: string;
};

const initialContactFormValues: ContactFormValues = {
	website: '',
	linkedin: '',
	github: '',
	x: '',
	facebook: '',
	youtube: '',
	instagram: '',
};

function ContactInfoSection() {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const {
		profile,
		status: profileStatus,
		error: profileError,
		fieldErrors: profileFieldErrors,
	} = useAppSelector((state) => state.profile);
	const [isContactModalOpen, setIsContactModalOpen] = React.useState(false);
	const [contactFormValues, setContactFormValues] =
		React.useState<ContactFormValues>(initialContactFormValues);

	React.useEffect(() => {
		if (!isContactModalOpen) return;

		setContactFormValues({
			website: profile?.website ?? '',
			linkedin: profile?.social?.linkedin ?? '',
			github: profile?.social?.github ?? '',
			x: profile?.social?.x ?? '',
			facebook: profile?.social?.facebook ?? '',
			youtube: profile?.social?.youtube ?? '',
			instagram: profile?.social?.instagram ?? '',
		});
	}, [isContactModalOpen, profile]);

	const closeContactModal = () => {
		setIsContactModalOpen(false);
		dispatch(clearProfileErrors());
	};

	const handleOpenContactModal = () => {
		dispatch(clearProfileErrors());
		setIsContactModalOpen(true);
	};

	const handleContactInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const { name, value } = event.target;

		setContactFormValues((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === 'website') {
			dispatch(clearProfileFieldError('website'));
			return;
		}

		dispatch(clearProfileFieldError(`social.${name}`));
	};

	const handleContactSubmit = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const actionResult = await dispatch(
			upsertProfile({
				skills: profile?.skills,
				about: profile?.about,
				location: profile?.location,
				website: contactFormValues.website.trim(),
				social: {
					linkedin: contactFormValues.linkedin.trim(),
					github: contactFormValues.github.trim(),
					x: contactFormValues.x.trim(),
					facebook: contactFormValues.facebook.trim(),
					youtube: contactFormValues.youtube.trim(),
					instagram: contactFormValues.instagram.trim(),
				},
			}),
		);

		if (upsertProfile.fulfilled.match(actionResult)) {
			closeContactModal();
		}
	};

	const renderUrlValue = (value?: string) => {
		const trimmedValue = value?.trim();

		if (!trimmedValue) {
			return <span className="profile-contact-empty">Not provided</span>;
		}

		return (
			<a href={trimmedValue} target="_blank" rel="noreferrer noopener">
				{trimmedValue}
			</a>
		);
	};

	return (
		<EditableSection
			className="profile-contact-section"
			headerContent={<h2>Contact info</h2>}
			content={
				<div className="profile-contact-list">
					<p className="profile-contact-item">
						<span className="profile-contact-label">Email</span>
						<span className="profile-contact-value">
							{user?.email || 'Not available'}
						</span>
					</p>
					<p className="profile-contact-item">
						<span className="profile-contact-label">Website</span>
						<span className="profile-contact-value">
							{renderUrlValue(profile?.website)}
						</span>
					</p>
					<p className="profile-contact-item">
						<span className="profile-contact-label">LinkedIn</span>
						<span className="profile-contact-value">
							{renderUrlValue(profile?.social?.linkedin)}
						</span>
					</p>
					<p className="profile-contact-item">
						<span className="profile-contact-label">GitHub</span>
						<span className="profile-contact-value">
							{renderUrlValue(profile?.social?.github)}
						</span>
					</p>
					<p className="profile-contact-item">
						<span className="profile-contact-label">X</span>
						<span className="profile-contact-value">
							{renderUrlValue(profile?.social?.x)}
						</span>
					</p>
					<p className="profile-contact-item">
						<span className="profile-contact-label">Facebook</span>
						<span className="profile-contact-value">
							{renderUrlValue(profile?.social?.facebook)}
						</span>
					</p>
					<p className="profile-contact-item">
						<span className="profile-contact-label">YouTube</span>
						<span className="profile-contact-value">
							{renderUrlValue(profile?.social?.youtube)}
						</span>
					</p>
					<p className="profile-contact-item">
						<span className="profile-contact-label">Instagram</span>
						<span className="profile-contact-value">
							{renderUrlValue(profile?.social?.instagram)}
						</span>
					</p>
				</div>
			}
			isModalOpen={isContactModalOpen}
			onOpen={handleOpenContactModal}
			onClose={closeContactModal}
			modalTitle="Edit contact info"
			onSubmit={handleContactSubmit}
			isSubmitting={profileStatus === 'loading'}
			errorMessage={profileError}
		>
			<Input
				name="website"
				label="Website"
				type="url"
				value={contactFormValues.website}
				onChange={handleContactInputChange}
				error={profileFieldErrors.website}
			/>
			<Input
				name="linkedin"
				label="LinkedIn"
				type="url"
				value={contactFormValues.linkedin}
				onChange={handleContactInputChange}
				error={profileFieldErrors['social.linkedin']}
			/>
			<Input
				name="github"
				label="GitHub"
				type="url"
				value={contactFormValues.github}
				onChange={handleContactInputChange}
				error={profileFieldErrors['social.github']}
			/>
			<Input
				name="x"
				label="X"
				type="url"
				value={contactFormValues.x}
				onChange={handleContactInputChange}
				error={profileFieldErrors['social.x']}
			/>
			<Input
				name="facebook"
				label="Facebook"
				type="url"
				value={contactFormValues.facebook}
				onChange={handleContactInputChange}
				error={profileFieldErrors['social.facebook']}
			/>
			<Input
				name="youtube"
				label="YouTube"
				type="url"
				value={contactFormValues.youtube}
				onChange={handleContactInputChange}
				error={profileFieldErrors['social.youtube']}
			/>
			<Input
				name="instagram"
				label="Instagram"
				type="url"
				value={contactFormValues.instagram}
				onChange={handleContactInputChange}
				error={profileFieldErrors['social.instagram']}
			/>
		</EditableSection>
	);
}

export default ContactInfoSection;
