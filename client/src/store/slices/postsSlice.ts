import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api';

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

type PostUser = {
	id?: string;
	_id?: string;
	name?: string;
	avatar?: string;
};

type PostLike = string | { id?: string; _id?: string };

export type PostComment = {
	id?: string;
	_id?: string;
	user?: string | PostUser;
	text: string;
	name?: string;
	avatar?: string;
	date?: string;
	editedAt?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type Post = {
	id?: string;
	_id?: string;
	text?: string;
	imageDataUrl?: string;
	user?: string | PostUser;
	name?: string;
	avatar?: string;
	likes?: PostLike[];
	comments?: PostComment[];
	createdAt?: string;
	updatedAt?: string;
};

type PostsPagination = {
	currentPage: number;
	totalPages: number;
	totalPosts: number;
	postsPerPage: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
};

type FetchPostsParams = {
	page?: number;
	limit?: number;
};

type CreatePostPayload = {
	text?: string;
	imageDataUrl?: string;
};

type AddCommentPayload = {
	postId: string;
	text: string;
};

type UpdateCommentPayload = {
	postId: string;
	commentId: string;
	text: string;
};

type DeleteCommentPayload = {
	postId: string;
	commentId: string;
};

type RejectValue = {
	message: string;
	status?: number;
};

type PostsState = {
	items: Post[];
	pagination: PostsPagination | null;
	status: AsyncStatus;
	error: string | null;
	createStatus: AsyncStatus;
	createError: string | null;
	actionStatusById: Record<string, 'idle' | 'loading'>;
	commentErrorByPostId: Record<string, string>;
};

type ApiValidationError = {
	msg?: string;
	path?: string;
};

type ApiErrorPayload = {
	msg?: string;
	errors?: ApiValidationError[];
};

type FetchPostsResponse = {
	posts: Post[];
	pagination: PostsPagination;
};

const initialState: PostsState = {
	items: [],
	pagination: null,
	status: 'idle',
	error: null,
	createStatus: 'idle',
	createError: null,
	actionStatusById: {},
	commentErrorByPostId: {},
};

function getErrorMessage(payload: ApiErrorPayload | null, fallback: string) {
	const firstValidationError = payload?.errors?.[0]?.msg;
	if (firstValidationError) return firstValidationError;
	return payload?.msg ?? fallback;
}

function getPostId(post: Pick<Post, 'id' | '_id'>) {
	return post._id ?? post.id;
}

function normalizeLikeIds(values: PostLike[]) {
	return values
		.map((value) =>
			typeof value === 'string' ? value : (value.id ?? value._id ?? ''),
		)
		.filter((value): value is string => Boolean(value));
}

function getCommentCreateActionKey(postId: string) {
	return `comment-create:${postId}`;
}

function getCommentDeleteActionKey(postId: string, commentId: string) {
	return `comment-delete:${postId}:${commentId}`;
}

function getCommentUpdateActionKey(postId: string, commentId: string) {
	return `comment-update:${postId}:${commentId}`;
}

export const fetchPosts = createAsyncThunk<
	FetchPostsResponse,
	FetchPostsParams | void,
	{ rejectValue: RejectValue }
>('posts/fetchPosts', async (params, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const page = params?.page ?? 1;
		const limit = params?.limit ?? 20;
		const url = `${API_ENDPOINTS.posts}?page=${page}&limit=${limit}`;

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const payload = (await response
				.json()
				.catch(() => null)) as ApiErrorPayload | null;
			return rejectWithValue({
				message: getErrorMessage(payload, 'Failed to load posts.'),
				status: response.status,
			});
		}

		const data = (await response.json()) as FetchPostsResponse;
		return data;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const createPost = createAsyncThunk<
	Post,
	CreatePostPayload,
	{ rejectValue: RejectValue }
>('posts/createPost', async ({ text, imageDataUrl }, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const normalizedText = text?.trim() ?? '';
		const normalizedImageDataUrl = imageDataUrl?.trim() ?? '';
		if (!normalizedText && !normalizedImageDataUrl) {
			return rejectWithValue({ message: 'Post text or image is required.' });
		}

		const response = await fetch(API_ENDPOINTS.posts, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				text: normalizedText || undefined,
				imageDataUrl: normalizedImageDataUrl || undefined,
			}),
		});

		if (!response.ok) {
			const payload = (await response
				.json()
				.catch(() => null)) as ApiErrorPayload | null;
			return rejectWithValue({
				message: getErrorMessage(payload, 'Failed to create post.'),
				status: response.status,
			});
		}

		const data = (await response.json()) as Post;
		return data;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const deletePost = createAsyncThunk<
	string,
	string,
	{ rejectValue: RejectValue }
>('posts/deletePost', async (postId, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.postById(postId), {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const payload = (await response
				.json()
				.catch(() => null)) as ApiErrorPayload | null;
			return rejectWithValue({
				message: getErrorMessage(payload, 'Failed to delete post.'),
				status: response.status,
			});
		}

		return postId;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const likePost = createAsyncThunk<
	{ postId: string; likes: string[] },
	string,
	{ rejectValue: RejectValue }
>('posts/likePost', async (postId, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.postLike(postId), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const payload = (await response
				.json()
				.catch(() => null)) as ApiErrorPayload | null;
			return rejectWithValue({
				message: getErrorMessage(payload, 'Failed to like post.'),
				status: response.status,
			});
		}

		const data = (await response.json()) as PostLike[];
		return { postId, likes: normalizeLikeIds(data) };
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const unlikePost = createAsyncThunk<
	{ postId: string; likes: string[] },
	string,
	{ rejectValue: RejectValue }
>('posts/unlikePost', async (postId, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.postUnlike(postId), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const payload = (await response
				.json()
				.catch(() => null)) as ApiErrorPayload | null;
			return rejectWithValue({
				message: getErrorMessage(payload, 'Failed to unlike post.'),
				status: response.status,
			});
		}

		const data = (await response.json()) as PostLike[];
		return { postId, likes: normalizeLikeIds(data) };
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const addComment = createAsyncThunk<
	{ postId: string; comments: PostComment[] },
	AddCommentPayload,
	{ rejectValue: RejectValue }
>('posts/addComment', async ({ postId, text }, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const normalizedText = text.trim();
		if (!normalizedText) {
			return rejectWithValue({ message: 'Comment text is required.' });
		}

		const response = await fetch(API_ENDPOINTS.postComments(postId), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ text: normalizedText }),
		});

		if (!response.ok) {
			const payload = (await response
				.json()
				.catch(() => null)) as ApiErrorPayload | null;
			return rejectWithValue({
				message: getErrorMessage(payload, 'Failed to add comment.'),
				status: response.status,
			});
		}

		const data = (await response.json()) as PostComment[];
		return { postId, comments: data };
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const updateComment = createAsyncThunk<
	{ postId: string; commentId: string; comments: PostComment[] },
	UpdateCommentPayload,
	{ rejectValue: RejectValue }
>(
	'posts/updateComment',
	async ({ postId, commentId, text }, { rejectWithValue }) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				return rejectWithValue({ message: 'No token found.' });
			}

			const normalizedText = text.trim();
			if (!normalizedText) {
				return rejectWithValue({ message: 'Comment text is required.' });
			}

			const response = await fetch(
				API_ENDPOINTS.postCommentById(postId, commentId),
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ text: normalizedText }),
				},
			);

			if (!response.ok) {
				const payload = (await response
					.json()
					.catch(() => null)) as ApiErrorPayload | null;
				return rejectWithValue({
					message: getErrorMessage(payload, 'Failed to update comment.'),
					status: response.status,
				});
			}

			const data = (await response.json()) as PostComment[];
			return { postId, commentId, comments: data };
		} catch (error) {
			console.error(error);
			return rejectWithValue({ message: 'Network error. Please try again.' });
		}
	},
);

export const deleteComment = createAsyncThunk<
	{ postId: string; commentId: string; comments: PostComment[] },
	DeleteCommentPayload,
	{ rejectValue: RejectValue }
>('posts/deleteComment', async ({ postId, commentId }, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(
			API_ENDPOINTS.postCommentById(postId, commentId),
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			const payload = (await response
				.json()
				.catch(() => null)) as ApiErrorPayload | null;
			return rejectWithValue({
				message: getErrorMessage(payload, 'Failed to delete comment.'),
				status: response.status,
			});
		}

		const data = (await response.json()) as PostComment[];
		return { postId, commentId, comments: data };
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

const postsSlice = createSlice({
	name: 'posts',
	initialState,
	reducers: {
		clearPostsError: (state) => {
			state.error = null;
		},
		clearCreatePostError: (state) => {
			state.createError = null;
		},
		clearCommentError: (state, action: { payload: string }) => {
			delete state.commentErrorByPostId[action.payload];
		},
	},
	extraReducers: (builder) => {
		const setPostComments = (
			state: PostsState,
			postId: string,
			comments: PostComment[],
		) => {
			const post = state.items.find((item) => getPostId(item) === postId);
			if (post) {
				post.comments = comments;
			}
		};

		builder
			.addCase(fetchPosts.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(fetchPosts.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.items = action.payload.posts;
				state.pagination = action.payload.pagination;
			})
			.addCase(fetchPosts.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to load posts.';
			})
			.addCase(createPost.pending, (state) => {
				state.createStatus = 'loading';
				state.createError = null;
			})
			.addCase(createPost.fulfilled, (state, action) => {
				state.createStatus = 'succeeded';
				const createdPostId = getPostId(action.payload);
				if (createdPostId) {
					state.items = state.items.filter(
						(existingPost) => getPostId(existingPost) !== createdPostId,
					);
				}
				state.items.unshift(action.payload);
				if (state.pagination) {
					state.pagination.totalPosts += 1;
				}
			})
			.addCase(createPost.rejected, (state, action) => {
				state.createStatus = 'failed';
				state.createError = action.payload?.message ?? 'Failed to create post.';
			})
			.addCase(deletePost.pending, (state, action) => {
				state.actionStatusById[action.meta.arg] = 'loading';
			})
			.addCase(deletePost.fulfilled, (state, action) => {
				delete state.actionStatusById[action.payload];
				state.items = state.items.filter(
					(post) => getPostId(post) !== action.payload,
				);
				if (state.pagination && state.pagination.totalPosts > 0) {
					state.pagination.totalPosts -= 1;
				}
			})
			.addCase(deletePost.rejected, (state, action) => {
				delete state.actionStatusById[action.meta.arg];
				state.error = action.payload?.message ?? 'Failed to delete post.';
			})
			.addCase(likePost.pending, (state, action) => {
				state.actionStatusById[action.meta.arg] = 'loading';
			})
			.addCase(likePost.fulfilled, (state, action) => {
				const { postId, likes } = action.payload;
				delete state.actionStatusById[postId];
				const post = state.items.find((item) => getPostId(item) === postId);
				if (post) {
					post.likes = likes;
				}
			})
			.addCase(likePost.rejected, (state, action) => {
				delete state.actionStatusById[action.meta.arg];
				state.error = action.payload?.message ?? 'Failed to like post.';
			})
			.addCase(unlikePost.pending, (state, action) => {
				state.actionStatusById[action.meta.arg] = 'loading';
			})
			.addCase(unlikePost.fulfilled, (state, action) => {
				const { postId, likes } = action.payload;
				delete state.actionStatusById[postId];
				const post = state.items.find((item) => getPostId(item) === postId);
				if (post) {
					post.likes = likes;
				}
			})
			.addCase(unlikePost.rejected, (state, action) => {
				delete state.actionStatusById[action.meta.arg];
				state.error = action.payload?.message ?? 'Failed to unlike post.';
			})
			.addCase(addComment.pending, (state, action) => {
				const postId = action.meta.arg.postId;
				state.actionStatusById[getCommentCreateActionKey(postId)] = 'loading';
				delete state.commentErrorByPostId[postId];
			})
			.addCase(addComment.fulfilled, (state, action) => {
				const { postId, comments } = action.payload;
				delete state.actionStatusById[getCommentCreateActionKey(postId)];
				delete state.commentErrorByPostId[postId];
				setPostComments(state, postId, comments);
			})
			.addCase(addComment.rejected, (state, action) => {
				const postId = action.meta.arg.postId;
				delete state.actionStatusById[getCommentCreateActionKey(postId)];
				state.commentErrorByPostId[postId] =
					action.payload?.message ?? 'Failed to add comment.';
			})
			.addCase(updateComment.pending, (state, action) => {
				const { postId, commentId } = action.meta.arg;
				state.actionStatusById[getCommentUpdateActionKey(postId, commentId)] =
					'loading';
				delete state.commentErrorByPostId[postId];
			})
			.addCase(updateComment.fulfilled, (state, action) => {
				const { postId, commentId, comments } = action.payload;
				delete state.actionStatusById[
					getCommentUpdateActionKey(postId, commentId)
				];
				delete state.commentErrorByPostId[postId];
				setPostComments(state, postId, comments);
			})
			.addCase(updateComment.rejected, (state, action) => {
				const { postId, commentId } = action.meta.arg;
				delete state.actionStatusById[
					getCommentUpdateActionKey(postId, commentId)
				];
				state.commentErrorByPostId[postId] =
					action.payload?.message ?? 'Failed to update comment.';
			})
			.addCase(deleteComment.pending, (state, action) => {
				const { postId, commentId } = action.meta.arg;
				state.actionStatusById[getCommentDeleteActionKey(postId, commentId)] =
					'loading';
			})
			.addCase(deleteComment.fulfilled, (state, action) => {
				const { postId, commentId, comments } = action.payload;
				delete state.actionStatusById[
					getCommentDeleteActionKey(postId, commentId)
				];
				setPostComments(state, postId, comments);
			})
			.addCase(deleteComment.rejected, (state, action) => {
				const { postId, commentId } = action.meta.arg;
				delete state.actionStatusById[
					getCommentDeleteActionKey(postId, commentId)
				];
				state.commentErrorByPostId[postId] =
					action.payload?.message ?? 'Failed to delete comment.';
			});
	},
});

export const { clearPostsError, clearCreatePostError, clearCommentError } =
	postsSlice.actions;

export default postsSlice.reducer;
