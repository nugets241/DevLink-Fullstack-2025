import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getUserData } from '../store/slices/authSlice';
import {
	createPost,
	deletePost,
	fetchPosts,
	likePost,
	unlikePost,
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
	} = useAppSelector((state) => state.posts);
	const [postText, setPostText] = React.useState('');
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
						<div className="card post-list">
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

								return (
									<article className="post-item" key={postId}>
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
									</article>
								);
							})}
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

export default Home;
