import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { formatDateLabel } from '../components/profile/utils/date';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
	clearViewedProfile,
	getProfileByUserId,
} from '../store/slices/profileSlice';

function UserProfile() {
	const { userId } = useParams<{ userId: string }>();
	const dispatch = useAppDispatch();
	const { viewedProfile, viewedProfileStatus, viewedProfileError } =
		useAppSelector((state) => state.profile);
	const [isContactInfoModalOpen, setIsContactInfoModalOpen] =
		React.useState(false);

	React.useEffect(() => {
		if (!userId) return;

		dispatch(getProfileByUserId(userId));

		return () => {
			dispatch(clearViewedProfile());
		};
	}, [dispatch, userId]);

	if (!userId) {
		return (
			<div className="container">
				<div className="loading-modal">
					<p>Invalid profile URL.</p>
				</div>
			</div>
		);
	}

	if (viewedProfileStatus === 'loading') {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading profile...</p>
				</div>
			</div>
		);
	}

	if (viewedProfileStatus === 'failed' || !viewedProfile) {
		return (
			<div className="container">
				<div className="loading-modal">
					<p>{viewedProfileError ?? 'Profile not found.'}</p>
					<Button
						type="button"
						variant="primary"
						onClick={() => dispatch(getProfileByUserId(userId))}
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	const avatarSrc = viewedProfile.user?.avatar?.trim() || '/devlink.svg';
	const socialEntries = [
		{ label: 'LinkedIn', value: viewedProfile.social?.linkedin },
		{ label: 'GitHub', value: viewedProfile.social?.github },
		{ label: 'X', value: viewedProfile.social?.x },
		{ label: 'Facebook', value: viewedProfile.social?.facebook },
		{ label: 'YouTube', value: viewedProfile.social?.youtube },
		{ label: 'Instagram', value: viewedProfile.social?.instagram },
	].filter((entry) => entry.value?.trim());

	const experiences = viewedProfile.experience ?? [];
	const educationEntries = viewedProfile.education ?? [];
	const skills = viewedProfile.skills ?? [];

	const openContactInfoModal = () => {
		setIsContactInfoModalOpen(true);
	};

	const closeContactInfoModal = () => {
		setIsContactInfoModalOpen(false);
	};

	return (
		<div className="profile-page">
			<div className="container">
				<section className="profile-section-card card ">
					<header className="profile-section-header">
						<img
							src={avatarSrc}
							alt="Avatar"
							className="profile-avatar"
							onError={(event) => {
								event.currentTarget.onerror = null;
								event.currentTarget.src = '/devlink.svg';
							}}
						/>
					</header>

					<div className="profile-contents profile-intro">
						<h1 className="heading-xl">
							{viewedProfile.user?.name ?? 'Developer'}
						</h1>
						<p className="profile-headline">
							{viewedProfile.status || 'Status not provided'}
						</p>
						<button
							type="button"
							className="contact-info-trigger"
							onClick={openContactInfoModal}
						>
							View contact info
						</button>
						<p className="profile-location">
							{viewedProfile.location || 'Location not provided'}
						</p>
					</div>
				</section>

				<section className="profile-section-card card">
					<header className="profile-section-header">
						<h2>About</h2>
					</header>
					<div className="profile-contents">
						<p className="profile-about-text">
							{viewedProfile.about || 'No bio added yet.'}
						</p>
					</div>
				</section>

				<section className="profile-section-card card">
					<header className="profile-section-header">
						<h2>Experience</h2>
					</header>
					<div className="profile-contents">
						<div className="experience-list">
							{experiences.length === 0 ? (
								<p className="experience-empty">No experience listed yet.</p>
							) : (
								experiences.map((experience, index) => {
									const fromLabel = formatDateLabel(experience.from);
									const toLabel = experience.current
										? 'Present'
										: formatDateLabel(experience.to);

									return (
										<article
											key={
												experience._id ||
												experience.id ||
												`${experience.company}-${index}`
											}
											className="experience-item"
										>
											<header className="experience-item-header">
												<div>
													<h3>{experience.title}</h3>
													<p>{experience.company}</p>
												</div>
											</header>
											{(fromLabel || toLabel) && (
												<p className="experience-dates">
													{fromLabel}
													{fromLabel && toLabel ? ' - ' : ''}
													{toLabel}
												</p>
											)}
											{experience.location && (
												<p className="experience-location">
													{experience.location}
												</p>
											)}
											{experience.description && (
												<p className="experience-description">
													{experience.description}
												</p>
											)}
										</article>
									);
								})
							)}
						</div>
					</div>
				</section>

				<section className="profile-section-card card">
					<header className="profile-section-header">
						<h2>Education</h2>
					</header>
					<div className="profile-contents">
						<div className="education-list">
							{educationEntries.length === 0 ? (
								<p className="education-empty">No education listed yet.</p>
							) : (
								educationEntries.map((education, index) => {
									const fromLabel = formatDateLabel(education.from);
									const toLabel = education.current
										? 'Present'
										: formatDateLabel(education.to);

									return (
										<article
											key={
												education._id ||
												education.id ||
												`${education.school}-${index}`
											}
											className="education-item"
										>
											<header className="education-item-header">
												<div>
													<h3>{education.school}</h3>
													<p>
														{education.degree}
														{education.fieldofstudy
															? `, ${education.fieldofstudy}`
															: ''}
													</p>
												</div>
											</header>
											{(fromLabel || toLabel) && (
												<p className="education-dates">
													{fromLabel}
													{fromLabel && toLabel ? ' - ' : ''}
													{toLabel}
												</p>
											)}
											{education.description && (
												<p className="education-description">
													{education.description}
												</p>
											)}
										</article>
									);
								})
							)}
						</div>
					</div>
				</section>

				<section className="profile-section-card card">
					<header className="profile-section-header">
						<h2>Skills</h2>
					</header>
					<div className="profile-contents">
						<div className="skill-list">
							{skills.length === 0 ? (
								<p className="skill-empty">No skills added yet.</p>
							) : (
								skills.map((skill, index) => (
									<article className="skill-item" key={`${skill}-${index}`}>
										<header className="skill-item-header">
											<h3>{skill}</h3>
										</header>
									</article>
								))
							)}
						</div>
					</div>
				</section>

				<Modal isOpen={isContactInfoModalOpen}>
					<div className="profile-contact-modal">
						<div className="profile-modal-header">
							<h2>Contact info</h2>
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
							<div className="contact-info-list">
								<p className="contact-info-item">
									<span className="contact-info-label">Website</span>
									<span className="contact-info-value">
										{viewedProfile.website ? (
											<a
												href={viewedProfile.website}
												target="_blank"
												rel="noreferrer noopener"
											>
												{viewedProfile.website}
											</a>
										) : (
											<span className="contact-info-empty">Not provided</span>
										)}
									</span>
								</p>
								{socialEntries.length === 0 ? (
									<p className="contact-info-item">
										<span className="contact-info-label">Social</span>
										<span className="contact-info-empty">Not provided</span>
									</p>
								) : (
									socialEntries.map((entry) => (
										<p className="contact-info-item" key={entry.label}>
											<span className="contact-info-label">{entry.label}</span>
											<span className="contact-info-value">
												<a
													href={entry.value}
													target="_blank"
													rel="noreferrer noopener"
												>
													{entry.value}
												</a>
											</span>
										</p>
									))
								)}
							</div>
						</div>
					</div>
				</Modal>
			</div>
		</div>
	);
}

export default UserProfile;
