import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPosts } from '../../store/slices/postsSlice';
import Button from '../common/Button';
import { formatPostDate, getPostId, getPostOwnerId } from '../post/postUtils';

function PostsSection() {
	const dispatch = useAppDispatch();
	const { token, user } = useAppSelector((state) => state.auth);
	const {
		items: posts,
		status: postsStatus,
		error: postsError,
	} = useAppSelector((state) => state.posts);
	const currentUserId =
		user?.id ?? (user as ({ _id?: string } & typeof user) | null)?._id;

	React.useEffect(() => {
		if (!token || postsStatus !== 'idle') return;
		dispatch(fetchPosts({ page: 1, limit: 50 }));
	}, [dispatch, postsStatus, token]);

	const createdPosts = React.useMemo(() => {
		if (!currentUserId) return [];
		return posts.filter((post) => getPostOwnerId(post) === currentUserId);
	}, [posts, currentUserId]);

	const isInitialLoading = postsStatus === 'loading' && posts.length === 0;

	return (
		<section className="profile-section-card card">
			<header className="profile-section-header">
				<h2>Posts</h2>
			</header>
			<div className="profile-contents">
				{isInitialLoading && (
					<p className="profile-post-empty">Loading your posts...</p>
				)}

				{!isInitialLoading && postsStatus === 'failed' && (
					<div className="profile-post-empty-state">
						<p className="profile-post-empty">
							{postsError ?? 'Could not load your posts.'}
						</p>
						<Button
							type="button"
							variant="tertiary"
							onClick={() => dispatch(fetchPosts({ page: 1, limit: 50 }))}
						>
							Try Again
						</Button>
					</div>
				)}

				{!isInitialLoading &&
					postsStatus !== 'failed' &&
					createdPosts.length === 0 && (
						<p className="profile-post-empty">
							You have not created any posts yet.
						</p>
					)}

				{!isInitialLoading &&
					postsStatus !== 'failed' &&
					createdPosts.length > 0 && (
						<div className="profile-post-list">
							{createdPosts.map((post) => {
								const postId = getPostId(post);
								if (!postId) return null;

								const likesCount = post.likes?.length ?? 0;
								const commentsCount = post.comments?.length ?? 0;
								const postImageSource = post.imageDataUrl?.trim();

								return (
									<article key={postId} className="profile-post-item">
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
								);
							})}
						</div>
					)}
			</div>
		</section>
	);
}

export default PostsSection;
