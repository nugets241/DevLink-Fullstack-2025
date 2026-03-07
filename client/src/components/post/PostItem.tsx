import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import type { Post } from '../../store/slices/postsSlice';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import CommentItem from './CommentItem';
import {
	formatPostDate,
	getCommentAuthor,
	getCommentEditKey,
	getCommentId,
	getCommentOwnerId,
	getLikeIds,
	getPostAuthor,
	getPostId,
	getPostOwnerId,
} from './postUtils';

type PostItemProps = {
	post: Post;
	currentUserId?: string;
	actionStatusById: Record<string, 'idle' | 'loading'>;
	commentDraft: string;
	commentError?: string;
	editingCommentKey: string | null;
	editingCommentText: string;
	onToggleLike: (post: Post) => void;
	onDeletePost: (post: Post) => void;
	onCommentDraftChange: (value: string) => void;
	onCreateComment: (event: React.FormEvent<HTMLFormElement>) => void;
	onStartEditComment: (commentId: string, text: string) => void;
	onCancelEditComment: () => void;
	onEditingCommentTextChange: (value: string) => void;
	onUpdateComment: (
		commentId: string,
		event: React.FormEvent<HTMLFormElement>,
	) => void;
	onDeleteComment: (commentId: string) => void;
};

function PostItem({
	post,
	currentUserId,
	actionStatusById,
	commentDraft,
	commentError,
	editingCommentKey,
	editingCommentText,
	onToggleLike,
	onDeletePost,
	onCommentDraftChange,
	onCreateComment,
	onStartEditComment,
	onCancelEditComment,
	onEditingCommentTextChange,
	onUpdateComment,
	onDeleteComment,
}: PostItemProps) {
	const postId = getPostId(post);
	if (!postId) return null;

	const ownerId = getPostOwnerId(post);
	const likeIds = getLikeIds(post);
	const isLiked = currentUserId ? likeIds.includes(currentUserId) : false;
	const isActionLoading = actionStatusById[postId] === 'loading';
	const isOwner = currentUserId ? ownerId === currentUserId : false;
	const { name, avatar } = getPostAuthor(post);
	const comments = post.comments ?? [];
	const isCommentCreating =
		actionStatusById[`comment-create:${postId}`] === 'loading';

	return (
		<article className="card post-item">
			<header className="post-item-header">
				<img
					src={avatar}
					alt={`${name} avatar`}
					className="post-item-avatar"
					onError={(event) => {
						event.currentTarget.onerror = null;
						event.currentTarget.src = '/devlink.svg';
					}}
				/>
				<div className="post-item-meta">
					<h3>{name}</h3>
					<p>{formatPostDate(post.createdAt)}</p>
				</div>
				{isOwner && (
					<Button
						type="button"
						variant="icon"
						className="post-item-delete"
						onClick={() => onDeletePost(post)}
						disabled={isActionLoading}
					>
						<MdOutlineClose aria-hidden="true" focusable="false" />
					</Button>
				)}
			</header>

			<p className="post-item-text">{post.text}</p>

			<div className="post-item-actions">
				<Button
					type="button"
					variant="tertiary"
					onClick={() => onToggleLike(post)}
					disabled={isActionLoading || !currentUserId}
				>
					{isLiked ? 'Unlike' : 'Like'} ({likeIds.length})
				</Button>
			</div>

			<div className="post-item-comments">
				<form className="post-comment-composer" onSubmit={onCreateComment}>
					<Textarea
						value={commentDraft}
						onChange={(event) => onCommentDraftChange(event.target.value)}
						placeholder="Write a comment..."
						aria-label={`Comment on ${name}'s post`}
						minRows={1}
					/>
					<div className="post-comment-composer-actions">
						<Button
							type="submit"
							variant="tertiary"
							disabled={!commentDraft.trim() || isCommentCreating}
						>
							{isCommentCreating ? 'Commenting...' : 'Comment'}
						</Button>
					</div>
				</form>

				{commentError && <p className="post-feed-error">{commentError}</p>}

				{comments.length > 0 && (
					<div className="post-comment-list">
						{comments.map((comment) => {
							const commentId = getCommentId(comment);
							if (!commentId) return null;

							const commentOwnerId = getCommentOwnerId(comment);
							const canManageComment = currentUserId
								? commentOwnerId === currentUserId
								: false;
							const commentEditKey = getCommentEditKey(postId, commentId);
							const isEditingComment = editingCommentKey === commentEditKey;
							const isCommentDeleteLoading =
								actionStatusById[`comment-delete:${postId}:${commentId}`] ===
								'loading';
							const isCommentUpdateLoading =
								actionStatusById[`comment-update:${postId}:${commentId}`] ===
								'loading';
							const commentAuthor = getCommentAuthor(comment);

							return (
								<CommentItem
									key={commentId}
									comment={comment}
									commentAuthor={commentAuthor}
									canManageComment={canManageComment}
									isEditingComment={isEditingComment}
									isCommentDeleteLoading={isCommentDeleteLoading}
									isCommentUpdateLoading={isCommentUpdateLoading}
									editingCommentText={editingCommentText}
									onStartEditComment={() =>
										onStartEditComment(commentId, comment.text)
									}
									onCancelEditComment={onCancelEditComment}
									onEditingCommentTextChange={onEditingCommentTextChange}
									onUpdateComment={(event) => onUpdateComment(commentId, event)}
									onDeleteComment={() => onDeleteComment(commentId)}
								/>
							);
						})}
					</div>
				)}
			</div>
		</article>
	);
}

export default PostItem;
