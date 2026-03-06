import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import postsReducer from './slices/postsSlice';

export const store = configureStore({
	reducer: {
		auth: authReducer,
		profile: profileReducer,
		posts: postsReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
