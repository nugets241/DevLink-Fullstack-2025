import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import { HiPhoto } from 'react-icons/hi2';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Textarea from '../common/Textarea';
import { Link } from 'react-router-dom';

const MAX_POST_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type PostComposerProps = {
	avatarSrc: string;
	avatarAlt: string;
	value: string;
	imageDataUrl: string;
	onChange: (value: string) => void;
	onImageDataUrlChange: (value: string) => void;
	onSubmit: (
		event: React.FormEvent<HTMLFormElement>,
	) => Promise<boolean> | boolean;
	isSubmitting: boolean;
};

function PostComposer({
	avatarSrc,
	avatarAlt,
	value,
	imageDataUrl,
	onChange,
	onImageDataUrlChange,
	onSubmit,
	isSubmitting,
}: PostComposerProps) {
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [imageError, setImageError] = React.useState<string | null>(null);
	const imageInputRef = React.useRef<HTMLInputElement | null>(null);
	const shouldOpenImagePickerRef = React.useRef(false);

	React.useEffect(() => {
		if (!isModalOpen || !shouldOpenImagePickerRef.current) return;

		shouldOpenImagePickerRef.current = false;
		window.setTimeout(() => {
			imageInputRef.current?.click();
		}, 0);
	}, [isModalOpen]);

	const handleCloseModal = () => {
		if (isSubmitting) return;
		setImageError(null);
		setIsModalOpen(false);
	};

	const handleModalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		const success = await Promise.resolve(onSubmit(event));
		if (success) {
			setImageError(null);
			setIsModalOpen(false);
		}
	};

	const handleImageFileChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			setImageError('Please select an image file.');
			input.value = '';
			return;
		}

		if (file.size > MAX_POST_IMAGE_SIZE_BYTES) {
			setImageError('Image must be 5MB or smaller.');
			input.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			if (typeof reader.result === 'string') {
				onImageDataUrlChange(reader.result);
				setImageError(null);
			}
		};
		reader.onerror = () => {
			setImageError('Failed to read image. Please try another file.');
		};
		reader.readAsDataURL(file);
		input.value = '';
	};

	const handleRemoveImage = () => {
		onImageDataUrlChange('');
		setImageError(null);
	};

	const handleOpenComposer = () => {
		setIsModalOpen(true);
	};

	const handleOpenComposerForImage = () => {
		if (isSubmitting) return;
		shouldOpenImagePickerRef.current = true;
		setIsModalOpen(true);
	};

	const handleChooseImageInModal = () => {
		if (isSubmitting) return;
		imageInputRef.current?.click();
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
					onClick={handleOpenComposer}
				>
					Start a post
				</button>
				<Button
					type="button"
					className="post-feed-composer-image-trigger"
					variant="tertiary"
					onClick={handleOpenComposerForImage}
					disabled={isSubmitting}
					aria-label="Start a post with an image"
					title="Choose image to post"
				>
					<HiPhoto aria-hidden="true" focusable="false" />
				</Button>
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
							<div className="field post-compose-image-field">
								<input
									id="post-image-file"
									className="post-compose-image-input"
									type="file"
									accept="image/png,image/jpeg,image/webp,image/gif"
									onChange={handleImageFileChange}
									disabled={isSubmitting}
									ref={imageInputRef}
								/>
								<button
									type="button"
									className="post-compose-image-trigger"
									onClick={handleChooseImageInModal}
									title="Choose image"
									aria-label="Choose image"
									disabled={isSubmitting}
								>
									<HiPhoto aria-hidden="true" focusable="false" />
									<span>Add image</span>
								</button>
								<p className="hint">Max size: 5MB.</p>
								{imageError ? <p className="error">{imageError}</p> : null}
							</div>
							{imageDataUrl ? (
								<div className="post-compose-image-preview-wrap">
									<img
										src={imageDataUrl}
										alt="Selected post"
										className="post-compose-image-preview"
									/>
									<Button
										type="button"
										variant="tertiary"
										onClick={handleRemoveImage}
										disabled={isSubmitting}
									>
										Remove image
									</Button>
								</div>
							) : null}
						</div>
						<div className="post-compose-modal-footer">
							<Button
								type="submit"
								variant="primary"
								disabled={
									(!value.trim() && !imageDataUrl.trim()) || isSubmitting
								}
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
