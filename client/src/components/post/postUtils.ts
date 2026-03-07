import type { Post, PostComment } from '../../store/slices/postsSlice';

export function getPostId(post: Pick<Post, 'id' | '_id'>) {
	return post._id ?? post.id ?? '';
}

export function getCommentId(comment: Pick<PostComment, 'id' | '_id'>) {
	return comment._id ?? comment.id ?? '';
}

export function getCommentEditKey(postId: string, commentId: string) {
	return `${postId}:${commentId}`;
}

export function getPostOwnerId(post: Post) {
	if (!post.user) return '';
	if (typeof post.user === 'string') return post.user;
	return post.user._id ?? post.user.id ?? '';
}

export function getLikeIds(post: Post) {
	return (post.likes ?? [])
		.map((like) =>
			typeof like === 'string' ? like : (like._id ?? like.id ?? ''),
		)
		.filter((value): value is string => Boolean(value));
}

export function getCommentOwnerId(comment: PostComment) {
	if (!comment.user) return '';
	if (typeof comment.user === 'string') return comment.user;
	return comment.user._id ?? comment.user.id ?? '';
}

export function getPostAuthor(post: Post) {
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

export function getCommentAuthor(comment: PostComment) {
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

export function formatPostDate(value?: string) {
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

export function formatCommentDate(value?: string) {
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
