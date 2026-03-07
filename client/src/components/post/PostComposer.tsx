import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Textarea from '../common/Textarea';
import { Link } from 'react-router-dom';

type PostComposerProps = {
	avatarSrc: string;
	avatarAlt: string;
	value: string;
	onChange: (value: string) => void;
	onSubmit: (
		event: React.FormEvent<HTMLFormElement>,
	) => Promise<boolean> | boolean;
	isSubmitting: boolean;
};

function PostComposer({
	avatarSrc,
	avatarAlt,
	value,
	onChange,
	onSubmit,
	isSubmitting,
}: PostComposerProps) {
	const [isModalOpen, setIsModalOpen] = React.useState(false);

	const handleCloseModal = () => {
		if (isSubmitting) return;
		setIsModalOpen(false);
	};

	const handleModalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		const success = await Promise.resolve(onSubmit(event));
		if (success) {
			setIsModalOpen(false);
		}
	};

	return (
		<>
			<div className="post-feed-composer-shell">
				<Link
					to="/profile"
					aria-label="Go to your profile"
					className="home-profile-link"
				>
					<img
						src={avatarSrc}
						alt={avatarAlt}
						className="post-feed-composer-avatar"
						onError={(event) => {
							event.currentTarget.onerror = null;
							event.currentTarget.src = '/devlink.svg';
						}}
					/>
				</Link>
				<button
					type="button"
					className="post-feed-composer-open"
					onClick={() => setIsModalOpen(true)}
				>
					Start a post
				</button>
			</div>

			<Modal isOpen={isModalOpen} preventClose={isSubmitting}>
				<div className="post-compose-modal">
					<div className="post-compose-modal-header">
						<h2>Create a post</h2>
						<Button
							type="button"
							variant="icon"
							onClick={handleCloseModal}
							aria-label="Close post composer"
							disabled={isSubmitting}
						>
							<MdOutlineClose aria-hidden="true" focusable="false" />
						</Button>
					</div>
					<form
						className="form post-compose-modal-form"
						onSubmit={handleModalSubmit}
					>
						<div className="post-compose-modal-body">
							<Textarea
								value={value}
								onChange={(event) => onChange(event.target.value)}
								placeholder="What do you want to talk about?"
								aria-label="Create a post"
								minRows={4}
							/>
						</div>
						<div className="post-compose-modal-footer">
							<Button
								type="submit"
								variant="primary"
								disabled={!value.trim() || isSubmitting}
							>
								{isSubmitting ? 'Posting...' : 'Post'}
							</Button>
						</div>
					</form>
				</div>
			</Modal>
		</>
	);
}

export default PostComposer;
