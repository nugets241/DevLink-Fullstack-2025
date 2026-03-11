import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
	addComment,
	deleteComment,
	deletePost,
	fetchPostById,
	likePost,
	unlikePost,
	updateComment,
	type Post,
} from '../store/slices/postsSlice';
import PostItem from '../components/post/PostItem';
import Button from '../components/common/Button';
import {
	getCommentEditKey,
	getLikeIds,
	getPostId,
} from '../components/post/postUtils';

function PostDetails() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { postId } = useParams<{ postId: string }>();
	const { token, user } = useAppSelector((state) => state.auth);
	const {
		items: posts,
		actionStatusById,
		commentErrorByPostId,
	} = useAppSelector((state) => state.posts);
	const [isPostBootstrapComplete, setIsPostBootstrapComplete] =
		React.useState(false);
	const [postLoadError, setPostLoadError] = React.useState<string | null>(null);
	const [commentDraft, setCommentDraft] = React.useState('');
	const [editingCommentKey, setEditingCommentKey] = React.useState<
		string | null
	>(null);
	const [editingCommentText, setEditingCommentText] = React.useState('');
	const currentUserId =
		user?.id ?? (user as ({ _id?: string } & typeof user) | null)?._id;
	const avatarSrc = user?.avatar?.trim() || '/devlink.svg';
	const post = React.useMemo(
		() => posts.find((item) => getPostId(item) === postId),
		[posts, postId],
	);

	React.useEffect(() => {
		let isMounted = true;

		if (!token || !postId) {
			setIsPostBootstrapComplete(true);
			return () => {
				isMounted = false;
			};
		}

		setIsPostBootstrapComplete(false);
		setPostLoadError(null);

		dispatch(fetchPostById(postId))
			.unwrap()
			.catch((thunkError: { message?: string } | undefined) => {
				if (!isMounted) return;
				setPostLoadError(thunkError?.message ?? 'Could not load this post.');
			})
			.finally(() => {
				if (!isMounted) return;
				setIsPostBootstrapComplete(true);
			});

		return () => {
			isMounted = false;
		};
	}, [dispatch, postId, token]);

	const handleToggleLike = async (targetPost: Post) => {
		const targetPostId = getPostId(targetPost);
		if (!targetPostId || !currentUserId) return;

		const likeIds = getLikeIds(targetPost);
		const isLiked = likeIds.includes(currentUserId);

		try {
			if (isLiked) {
				await dispatch(unlikePost(targetPostId)).unwrap();
				return;
			}

			await dispatch(likePost(targetPostId)).unwrap();
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	const handleDeletePost = async (targetPost: Post) => {
		const targetPostId = getPostId(targetPost);
		if (!targetPostId) return;

		try {
			await dispatch(deletePost(targetPostId)).unwrap();
			navigate(currentUserId ? `/profiles/${currentUserId}` : '/', {
				replace: true,
			});
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	const handleCreateComment = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		if (!postId) return;

		const normalizedText = commentDraft.trim();
		if (!normalizedText) return;

		try {
			await dispatch(addComment({ postId, text: normalizedText })).unwrap();
			setCommentDraft('');
		} catch (thunkError) {
			console.error(thunkError);
		}
	};

	const handleDeleteComment = async (commentId: string) => {
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

	const handleStartEditComment = (commentId: string, text: string) => {
		if (!postId) return;
		setEditingCommentKey(getCommentEditKey(postId, commentId));
		setEditingCommentText(text);
	};

	const handleCancelEditComment = () => {
		setEditingCommentKey(null);
		setEditingCommentText('');
	};

	const handleUpdateComment = async (
		commentId: string,
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		if (!postId) return;

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

	if (!postId) {
		return <Navigate to="/" replace />;
	}

	if (!isPostBootstrapComplete && !post) {
		return (
			<div className="container">
				<div className="loading-modal">
					<div className="spinner"></div>
					<p>Loading post...</p>
				</div>
			</div>
		);
	}

	if (!post) {
		return (
			<div className="container">
				<div className="card post-feed-empty-state">
					<p className="post-feed-empty">
						{postLoadError ?? 'Post not found or unavailable.'}
					</p>
					<Button
						type="button"
						variant="tertiary"
						onClick={() => dispatch(fetchPostById(postId))}
					>
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container">
			<div className="post-feed-section">
				<PostItem
					post={post}
					currentUserId={currentUserId}
					currentUserAvatarSrc={avatarSrc}
					actionStatusById={actionStatusById}
					commentDraft={commentDraft}
					commentError={commentErrorByPostId[postId]}
					editingCommentKey={editingCommentKey}
					editingCommentText={editingCommentText}
					onToggleLike={handleToggleLike}
					onDeletePost={handleDeletePost}
					onCommentDraftChange={setCommentDraft}
					onCreateComment={handleCreateComment}
					onStartEditComment={handleStartEditComment}
					onCancelEditComment={handleCancelEditComment}
					onEditingCommentTextChange={setEditingCommentText}
					onUpdateComment={handleUpdateComment}
					onDeleteComment={handleDeleteComment}
				/>
			</div>
		</div>
	);
}

export default PostDetails;
