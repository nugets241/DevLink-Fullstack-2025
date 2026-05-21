import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getUserData } from '../store/slices/authSlice';
import {
	addComment,
	createPost,
	deleteComment,
	deletePost,
	fetchPosts,
	likePost,
	updateComment,
	unlikePost,
	type Post,
} from '../store/slices/postsSlice';
import Button from '../components/common/Button';
import PostComposer from '../components/post/PostComposer';
import PostItem from '../components/post/PostItem';
import {
	getCommentEditKey,
	getLikeIds,
	getPostId,
} from '../components/post/postUtils';
import { Link } from 'react-router-dom';
import React from 'react';

function Home() {
	const dispatch = useAppDispatch();
	const { user, token, status, error } = useAppSelector((state) => state.auth);
	const {
		items: posts,
		status: postsStatus,
		error: postsError,
		pagination,
		createStatus,
		createError,
		actionStatusById,
		commentErrorByPostId,
	} = useAppSelector((state) => state.posts);
	const [postText, setPostText] = React.useState('');
	const [postImageDataUrl, setPostImageDataUrl] = React.useState('');
	const [commentDraftByPostId, setCommentDraftByPostId] = React.useState<
		Record<string, string>
	>({});
	const [editingCommentKey, setEditingCommentKey] = React.useState<
		string | null
	>(null);
	const [editingCommentText, setEditingCommentText] = React.useState('');
	const currentUserId =
		user?.id ?? (user as ({ _id?: string } & typeof user) | null)?._id;

	React.useEffect(() => {
		if (!token || postsStatus !== 'idle') return;
		dispatch(fetchPosts({ page: 1, limit: 20 }));
	}, [dispatch, postsStatus, token]);

	const handleLoadMorePosts = () => {
		if (postsStatus === 'loading') return;
		if (!pagination?.hasNextPage) return;

		dispatch(
			fetchPosts({
				page: (pagination.currentPage ?? 1) + 1,
				limit: pagination.postsPerPage ?? 20,
			}),
		);
	};

	const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const normalizedText = postText.trim();
		const normalizedImageDataUrl = postImageDataUrl.trim();
		if (!normalizedText && !normalizedImageDataUrl) return false;

		try {
			await dispatch(
				createPost({
					text: normalizedText,
					imageDataUrl: normalizedImageDataUrl,
				}),
			).unwrap();
			setPostText('');
			setPostImageDataUrl('');
			return true;
		} catch (thunkError) {
			console.error(thunkError);
			return false;
		}
	};

	const handleToggleLike = async (post: Post) => {
		const postId = getPostId(post);
		if (!postId || !currentUserId) return;

		const likeIds = getLikeIds(post);
		const isLiked = likeIds.includes(currentUserId);

		try {
			if (isLiked) {
				await dispatch(unlikePost(postId)).unwrap();
				return;
			}

			await dispatch(likePost(postId)).unwrap();
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	const handleDeletePost = async (post: Post) => {
		const postId = getPostId(post);
		if (!postId) return;

		try {
			await dispatch(deletePost(postId)).unwrap();
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	const handleCreateComment = async (
		postId: string,
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const normalizedText = (commentDraftByPostId[postId] ?? '').trim();
		if (!normalizedText) return;

		try {
			await dispatch(addComment({ postId, text: normalizedText })).unwrap();
			setCommentDraftByPostId((previous) => ({
				...previous,
				[postId]: '',
			}));
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	const handleDeleteComment = async (postId: string, commentId: string) => {
		if (!postId || !commentId) return;

		const commentEditKey = getCommentEditKey(postId, commentId);

		try {
			await dispatch(deleteComment({ postId, commentId })).unwrap();
			if (editingCommentKey === commentEditKey) {
				setEditingCommentKey(null);
				setEditingCommentText('');
			}
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	const handleStartEditComment = (
		postId: string,
		commentId: string,
		text: string,
	) => {
		setEditingCommentKey(getCommentEditKey(postId, commentId));
		setEditingCommentText(text);
	};

	const handleCancelEditComment = () => {
		setEditingCommentKey(null);
		setEditingCommentText('');
	};

	const handleUpdateComment = async (
		postId: string,
		commentId: string,
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const normalizedText = editingCommentText.trim();
		if (!normalizedText) return;

		try {
			await dispatch(
				updateComment({
					postId,
					commentId,
					text: normalizedText,
				}),
			).unwrap();
			setEditingCommentKey(null);
			setEditingCommentText('');
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	if (!token) {
		return null;
	}

	if (status === 'loading') {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading your profile...</p>
				</div>
			</div>
		);
	}

	if (status === 'failed' && !user) {
		return (
			<div className="container">
				<div className="loading-modal">
					<p>{error ?? 'Could not load your profile.'}</p>
					<Button
						type="button"
						variant="primary"
						onClick={() => dispatch(getUserData())}
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Preparing your home page...</p>
				</div>
			</div>
		);
	}

	const avatarSrc = user.avatar?.trim() || '/devlink.svg';

	return (
		<div className="container">
			<div className="home-layout">
				<aside className="card home-profile-summary">
					<Link
						to="/profile"
						aria-label="Go to your profile"
						className="home-profile-link"
					>
						<img
							src={avatarSrc}
							alt="Avatar"
							className="home-profile-avatar"
							onError={(event) => {
								event.currentTarget.onerror = null;
								event.currentTarget.src = '/devlink.svg';
							}}
						/>
						<h2>{user.name}</h2>
						<p className="home-profile-headline">
							{user?.headline || 'Add a headline'}
						</p>
						<p className="home-profile-location">
							{user?.location || 'Add your location'}
						</p>
					</Link>
				</aside>
				<main className="post-feed-section">
					<div className="card">
						<PostComposer
							avatarSrc={avatarSrc}
							avatarAlt={`${user.name} avatar`}
							value={postText}
							imageDataUrl={postImageDataUrl}
							onChange={setPostText}
							onImageDataUrlChange={setPostImageDataUrl}
							onSubmit={handleCreatePost}
							isSubmitting={createStatus === 'loading'}
						/>

						{createError && <p className="post-feed-error">{createError}</p>}
						{postsError && <p className="post-feed-error">{postsError}</p>}

						{postsStatus === 'loading' && posts.length === 0 ? (
							<p className="post-feed-empty">Loading posts...</p>
						) : null}

						{postsStatus === 'failed' && posts.length === 0 ? (
							<div className="post-feed-empty-state">
								<p className="post-feed-empty">Could not load posts.</p>
								<Button
									type="button"
									variant="tertiary"
									onClick={() => dispatch(fetchPosts({ page: 1, limit: 20 }))}
								>
									Try Again
								</Button>
							</div>
						) : null}
						{postsStatus !== 'loading' && posts.length === 0 ? (
							<p className="post-feed-empty">No posts yet.</p>
						) : null}
					</div>

					{posts.length > 0 && (
						<>
							{posts.map((post) => {
								const postId = getPostId(post);
								if (!postId) return null;

								return (
									<PostItem
										key={postId}
										post={post}
										currentUserId={currentUserId}
										currentUserAvatarSrc={avatarSrc}
										actionStatusById={actionStatusById}
										commentDraft={commentDraftByPostId[postId] ?? ''}
										commentError={commentErrorByPostId[postId]}
										editingCommentKey={editingCommentKey}
										editingCommentText={editingCommentText}
										onToggleLike={handleToggleLike}
										onDeletePost={handleDeletePost}
										onCommentDraftChange={(value) =>
											setCommentDraftByPostId((previous) => ({
												...previous,
												[postId]: value,
											}))
										}
										onCreateComment={(event) =>
											handleCreateComment(postId, event)
										}
										onStartEditComment={(commentId, text) =>
											handleStartEditComment(postId, commentId, text)
										}
										onCancelEditComment={handleCancelEditComment}
										onEditingCommentTextChange={setEditingCommentText}
										onUpdateComment={(commentId, event) =>
											handleUpdateComment(postId, commentId, event)
										}
										onDeleteComment={(commentId) =>
											handleDeleteComment(postId, commentId)
										}
									/>
								);
							})}
							{pagination?.hasNextPage ? (
								<div className="card">
									<Button
										type="button"
										variant="tertiary"
										onClick={handleLoadMorePosts}
										disabled={postsStatus === 'loading'}
									>
										{postsStatus === 'loading' ? 'Loading...' : 'Load more'}
									</Button>
								</div>
							) : null}
						</>
					)}
				</main>
			</div>
		</div>
	);
}

export default Home;
