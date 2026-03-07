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
	type PostComment,
	type Post,
} from '../store/slices/postsSlice';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import { Link } from 'react-router-dom';
import React from 'react';
import { MdOutlineClose } from 'react-icons/md';

function getPostId(post: Pick<Post, 'id' | '_id'>) {
	return post._id ?? post.id ?? '';
}

function getCommentId(comment: Pick<PostComment, 'id' | '_id'>) {
	return comment._id ?? comment.id ?? '';
}

function getCommentEditKey(postId: string, commentId: string) {
	return `${postId}:${commentId}`;
}

function getPostOwnerId(post: Post) {
	if (!post.user) return '';
	if (typeof post.user === 'string') return post.user;
	return post.user._id ?? post.user.id ?? '';
}

function getLikeIds(post: Post) {
	return (post.likes ?? [])
		.map((like) =>
			typeof like === 'string' ? like : (like._id ?? like.id ?? ''),
		)
		.filter((value): value is string => Boolean(value));
}

function getCommentOwnerId(comment: PostComment) {
	if (!comment.user) return '';
	if (typeof comment.user === 'string') return comment.user;
	return comment.user._id ?? comment.user.id ?? '';
}

function getPostAuthor(post: Post) {
	const name =
		post.name?.trim() ||
		(typeof post.user === 'string' ? '' : post.user?.name) ||
		'Unknown user';
	const avatar =
		post.avatar?.trim() ||
		(typeof post.user === 'string' ? '' : (post.user?.avatar ?? '').trim()) ||
		'/devlink.svg';

	return { name, avatar };
}

function getCommentAuthor(comment: PostComment) {
	const name =
		comment.name?.trim() ||
		(typeof comment.user === 'string' ? '' : comment.user?.name) ||
		'Unknown user';
	const avatar =
		comment.avatar?.trim() ||
		(typeof comment.user === 'string'
			? ''
			: (comment.user?.avatar ?? '').trim()) ||
		'/devlink.svg';

	return { name, avatar };
}

function formatPostDate(value?: string) {
	if (!value) return 'Just now';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Just now';
	return date.toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}

function formatCommentDate(value?: string) {
	if (!value) return 'Just now';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Just now';
	return date.toLocaleString(undefined, {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}

function Home() {
	const dispatch = useAppDispatch();
	const { user, token, status, error } = useAppSelector((state) => state.auth);
	const {
		items: posts,
		status: postsStatus,
		error: postsError,
		createStatus,
		createError,
		actionStatusById,
		commentErrorByPostId,
	} = useAppSelector((state) => state.posts);
	const [postText, setPostText] = React.useState('');
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

	const handleCreatePost = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const normalizedText = postText.trim();
		if (!normalizedText) return;

		try {
			await dispatch(createPost(normalizedText)).unwrap();
			setPostText('');
		} catch (thunkError) {
			console.error(thunkError);
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
				<aside className="card profile-summary">
					<Link
						to="/profile"
						aria-label="Go to your profile"
						className="profile-link"
					>
						<img
							src={avatarSrc}
							alt="Avatar"
							className="profile-avatar"
							onError={(event) => {
								event.currentTarget.onerror = null;
								event.currentTarget.src = '/devlink.svg';
							}}
						/>
						<h2>{user.name}</h2>
						<p className="profile-headline">
							{user?.headline || 'Add a headline'}
						</p>
						<p className="profile-location">
							{user?.location || 'Add your location'}
						</p>
					</Link>
				</aside>
				<main className="posts-section">
					<div className="card posts-card">
						<form className="post-composer" onSubmit={handleCreatePost}>
							<Textarea
								value={postText}
								onChange={(event) => setPostText(event.target.value)}
								placeholder="Share something with your network..."
								aria-label="Create a post"
								minRows={3}
							/>
							<div className="post-composer-actions">
								<Button
									type="submit"
									variant="primary"
									disabled={!postText.trim() || createStatus === 'loading'}
								>
									{createStatus === 'loading' ? 'Posting...' : 'Post'}
								</Button>
							</div>
						</form>

						{createError && <p className="posts-error">{createError}</p>}
						{postsError && <p className="posts-error">{postsError}</p>}

						{postsStatus === 'loading' && posts.length === 0 ? (
							<p className="posts-empty">Loading posts...</p>
						) : null}

						{postsStatus === 'failed' && posts.length === 0 ? (
							<div className="posts-empty-state">
								<p className="posts-empty">Could not load posts.</p>
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
							<p className="posts-empty">No posts yet.</p>
						) : null}
					</div>

					{posts.length > 0 && (
						<>
							{posts.map((post) => {
								const postId = getPostId(post);
								if (!postId) return null;

								const ownerId = getPostOwnerId(post);
								const likeIds = getLikeIds(post);
								const isLiked = currentUserId
									? likeIds.includes(currentUserId)
									: false;
								const isActionLoading = actionStatusById[postId] === 'loading';
								const isOwner = currentUserId
									? ownerId === currentUserId
									: false;
								const { name, avatar } = getPostAuthor(post);
								const comments = post.comments ?? [];
								const commentDraft = commentDraftByPostId[postId] ?? '';
								const isCommentCreating =
									actionStatusById[`comment-create:${postId}`] === 'loading';
								const commentError = commentErrorByPostId[postId];

								return (
									<article className="card post-item" key={postId}>
										<header className="post-header">
											<img
												src={avatar}
												alt={`${name} avatar`}
												className="post-avatar"
												onError={(event) => {
													event.currentTarget.onerror = null;
													event.currentTarget.src = '/devlink.svg';
												}}
											/>
											<div className="post-meta">
												<h3>{name}</h3>
												<p>{formatPostDate(post.createdAt)}</p>
											</div>
											{isOwner && (
												<Button
													type="button"
													variant="icon"
													className="post-delete"
													onClick={() => handleDeletePost(post)}
													disabled={isActionLoading}
												>
													<MdOutlineClose
														aria-hidden="true"
														focusable="false"
													/>
												</Button>
											)}
										</header>

										<p className="post-text">{post.text}</p>

										<div className="post-actions">
											<Button
												type="button"
												variant="tertiary"
												onClick={() => handleToggleLike(post)}
												disabled={isActionLoading || !currentUserId}
											>
												{isLiked ? 'Unlike' : 'Like'} ({likeIds.length})
											</Button>
										</div>

										<div className="post-comments">
											<form
												className="comment-composer"
												onSubmit={(event) => handleCreateComment(postId, event)}
											>
												<Textarea
													value={commentDraft}
													onChange={(event) =>
														setCommentDraftByPostId((previous) => ({
															...previous,
															[postId]: event.target.value,
														}))
													}
													placeholder="Write a comment..."
													aria-label={`Comment on ${name}'s post`}
													minRows={1}
												/>
												<div className="comment-composer-actions">
													<Button
														type="submit"
														variant="tertiary"
														disabled={!commentDraft.trim() || isCommentCreating}
													>
														{isCommentCreating ? 'Commenting...' : 'Comment'}
													</Button>
												</div>
											</form>

											{commentError && (
												<p className="posts-error">{commentError}</p>
											)}

											{comments.length > 0 && (
												<div className="comment-list">
													{comments.map((comment) => {
														const commentId = getCommentId(comment);
														if (!commentId) return null;

														const commentOwnerId = getCommentOwnerId(comment);
														const canManageComment = currentUserId
															? commentOwnerId === currentUserId
															: false;
														const commentEditKey = getCommentEditKey(
															postId,
															commentId,
														);
														const isEditingComment =
															editingCommentKey === commentEditKey;
														const isCommentDeleteLoading =
															actionStatusById[
																`comment-delete:${postId}:${commentId}`
															] === 'loading';
														const isCommentUpdateLoading =
															actionStatusById[
																`comment-update:${postId}:${commentId}`
															] === 'loading';
														const commentAuthor = getCommentAuthor(comment);

														return (
															<article className="comment-item" key={commentId}>
																<img
																	src={commentAuthor.avatar}
																	alt={`${commentAuthor.name} avatar`}
																	className="comment-avatar"
																	onError={(event) => {
																		event.currentTarget.onerror = null;
																		event.currentTarget.src = '/devlink.svg';
																	}}
																/>
																<div className="comment-content">
																	<div className="comment-meta">
																		<strong>{commentAuthor.name}</strong>
																		<span>
																			{formatCommentDate(
																				comment.date ?? comment.createdAt,
																			)}
																		</span>
																		{comment.editedAt && (
																			<span className="comment-edited">
																				edited
																			</span>
																		)}
																	</div>
																	{isEditingComment ? (
																		<form
																			className="comment-edit-form"
																			onSubmit={(event) =>
																				handleUpdateComment(
																					postId,
																					commentId,
																					event,
																				)
																			}
																		>
																			<Textarea
																				value={editingCommentText}
																				onChange={(event) =>
																					setEditingCommentText(
																						event.target.value,
																					)
																				}
																				aria-label={`Edit comment by ${commentAuthor.name}`}
																				minRows={1}
																			/>
																			<div className="comment-edit-actions">
																				<Button
																					type="submit"
																					variant="tertiary"
																					disabled={
																						!editingCommentText.trim() ||
																						isCommentUpdateLoading
																					}
																				>
																					{isCommentUpdateLoading
																						? 'Saving...'
																						: 'Save'}
																				</Button>
																				<Button
																					type="button"
																					variant="tertiary"
																					onClick={handleCancelEditComment}
																					disabled={isCommentUpdateLoading}
																				>
																					Cancel
																				</Button>
																			</div>
																		</form>
																	) : (
																		<p>{comment.text}</p>
																	)}
																</div>
																{canManageComment && (
																	<div className="comment-item-actions">
																		{!isEditingComment && (
																			<Button
																				type="button"
																				variant="tertiary"
																				className="comment-edit-trigger"
																				onClick={() =>
																					handleStartEditComment(
																						postId,
																						commentId,
																						comment.text,
																					)
																				}
																				disabled={
																					isCommentDeleteLoading ||
																					isCommentUpdateLoading
																				}
																			>
																				Edit
																			</Button>
																		)}
																		<Button
																			type="button"
																			variant="icon"
																			className="comment-delete"
																			onClick={() =>
																				handleDeleteComment(postId, commentId)
																			}
																			disabled={
																				isCommentDeleteLoading ||
																				isCommentUpdateLoading
																			}
																		>
																			<MdOutlineClose
																				aria-hidden="true"
																				focusable="false"
																			/>
																		</Button>
																	</div>
																)}
															</article>
														);
													})}
												</div>
											)}
										</div>
									</article>
								);
							})}
						</>
					)}
				</main>
			</div>
		</div>
	);
}

export default Home;
