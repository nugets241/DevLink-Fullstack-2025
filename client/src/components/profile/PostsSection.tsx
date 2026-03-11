import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPosts } from '../../store/slices/postsSlice';
import { getPostOwnerId } from '../post/postUtils';
import ProfilePostsSection from './ProfilePostsSection';
import { PROFILE_POSTS_FETCH_PARAMS } from './profilePostsConfig';

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
		dispatch(fetchPosts(PROFILE_POSTS_FETCH_PARAMS));
	}, [dispatch, postsStatus, token]);

	const createdPosts = React.useMemo(() => {
		if (!currentUserId) return [];
		return posts.filter((post) => getPostOwnerId(post) === currentUserId);
	}, [posts, currentUserId]);

	const isInitialLoading = postsStatus === 'loading' && posts.length === 0;

	return (
		<ProfilePostsSection
			posts={createdPosts}
			isLoading={isInitialLoading}
			hasError={postsStatus === 'failed'}
			errorMessage={postsError}
			emptyMessage="You have not created any posts yet."
			loadingMessage="Loading your posts..."
			errorFallbackMessage="Could not load your posts."
			onRetry={() => dispatch(fetchPosts(PROFILE_POSTS_FETCH_PARAMS))}
		/>
	);
}

export default PostsSection;
