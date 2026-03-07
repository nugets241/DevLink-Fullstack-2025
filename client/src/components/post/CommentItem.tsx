import React from 'react';
import { MdOutlineClose } from 'react-icons/md';
import type { PostComment } from '../../store/slices/postsSlice';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import { formatCommentDate } from './postUtils';

type CommentItemProps = {
	comment: PostComment;
	commentAuthor: {
		name: string;
		avatar: string;
	};
	canManageComment: boolean;
	isEditingComment: boolean;
	isCommentDeleteLoading: boolean;
	isCommentUpdateLoading: boolean;
	editingCommentText: string;
	onStartEditComment: () => void;
	onCancelEditComment: () => void;
	onEditingCommentTextChange: (value: string) => void;
	onUpdateComment: (event: React.FormEvent<HTMLFormElement>) => void;
	onDeleteComment: () => void;
};

function CommentItem({
	comment,
	commentAuthor,
	canManageComment,
	isEditingComment,
	isCommentDeleteLoading,
	isCommentUpdateLoading,
	editingCommentText,
	onStartEditComment,
	onCancelEditComment,
	onEditingCommentTextChange,
	onUpdateComment,
	onDeleteComment,
}: CommentItemProps) {
	return (
		<article className="comment-item">
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
					<span>{formatCommentDate(comment.date ?? comment.createdAt)}</span>
					{comment.editedAt && <span className="comment-edited">edited</span>}
				</div>
				{isEditingComment ? (
					<form className="comment-edit-form" onSubmit={onUpdateComment}>
						<Textarea
							value={editingCommentText}
							onChange={(event) =>
								onEditingCommentTextChange(event.target.value)
							}
							aria-label={`Edit comment by ${commentAuthor.name}`}
							minRows={1}
						/>
						<div className="comment-edit-actions">
							<Button
								type="submit"
								variant="tertiary"
								disabled={!editingCommentText.trim() || isCommentUpdateLoading}
							>
								{isCommentUpdateLoading ? 'Saving...' : 'Save'}
							</Button>
							<Button
								type="button"
								variant="tertiary"
								onClick={onCancelEditComment}
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
							onClick={onStartEditComment}
							disabled={isCommentDeleteLoading || isCommentUpdateLoading}
						>
							Edit
						</Button>
					)}
					<Button
						type="button"
						variant="icon"
						className="comment-delete"
						onClick={onDeleteComment}
						disabled={isCommentDeleteLoading || isCommentUpdateLoading}
					>
						<MdOutlineClose aria-hidden="true" focusable="false" />
					</Button>
				</div>
			)}
		</article>
	);
}

export default CommentItem;
