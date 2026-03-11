import { Link } from 'react-router-dom';
import type { Post } from '../../store/slices/postsSlice';
import Button from '../common/Button';
import { formatPostDate, getPostId } from '../post/postUtils';

type ProfilePostsSectionProps = {
	title?: string;
	posts: Post[];
	isLoading: boolean;
	hasError: boolean;
	errorMessage?: string | null;
	emptyMessage: string;
	loadingMessage: string;
	errorFallbackMessage: string;
	onRetry: () => void;
};

function ProfilePostsSection({
	title = 'Posts',
	posts,
	isLoading,
	hasError,
	errorMessage,
	emptyMessage,
	loadingMessage,
	errorFallbackMessage,
	onRetry,
}: ProfilePostsSectionProps) {
	return (
		<section className="profile-section-card card">
			<header className="profile-section-header">
				<h2>{title}</h2>
			</header>
			<div className="profile-contents">
				{isLoading && <p className="profile-post-empty">{loadingMessage}</p>}

				{!isLoading && hasError && (
					<div className="profile-post-empty-state">
						<p className="profile-post-empty">
							{errorMessage ?? errorFallbackMessage}
						</p>
						<Button type="button" variant="tertiary" onClick={onRetry}>
							Try Again
						</Button>
					</div>
				)}

				{!isLoading && !hasError && posts.length === 0 && (
					<p className="profile-post-empty">{emptyMessage}</p>
				)}

				{!isLoading && !hasError && posts.length > 0 && (
					<div className="profile-post-list">
						{posts.map((post) => {
							const postId = getPostId(post);
							if (!postId) return null;

							const likesCount = post.likes?.length ?? 0;
							const commentsCount = post.comments?.length ?? 0;
							const postImageSource = post.imageDataUrl?.trim();

							return (
								<Link
									key={postId}
									to={`/posts/${postId}`}
									className="profile-post-link"
									aria-label={`Open post from ${formatPostDate(post.createdAt)}`}
								>
									<article className="profile-post-item">
										<p className="profile-post-item-date">
											{formatPostDate(post.createdAt)}
										</p>
										{post.text?.trim() ? (
											<p className="profile-post-item-text">{post.text}</p>
										) : null}
										{postImageSource ? (
											<img
												src={postImageSource}
												alt="Post attachment"
												className="profile-post-item-image"
												onError={(event) => {
													event.currentTarget.onerror = null;
													event.currentTarget.style.display = 'none';
												}}
											/>
										) : null}
										<p className="profile-post-item-stats">
											{likesCount} {likesCount === 1 ? 'like' : 'likes'} •{' '}
											{commentsCount}{' '}
											{commentsCount === 1 ? 'comment' : 'comments'}
										</p>
									</article>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</section>
	);
}

export default ProfilePostsSection;
