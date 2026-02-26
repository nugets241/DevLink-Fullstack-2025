import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api';

type ProfileUser = {
	id?: string;
	_id?: string;
	name?: string;
	avatar?: string;
};

type ProfileSocial = {
	youtube?: string;
	x?: string;
	facebook?: string;
	linkedin?: string;
	instagram?: string;
	github?: string;
};

type Profile = {
	_id?: string;
	user?: ProfileUser;
	company?: string;
	website?: string;
	location?: string;
	about?: string;
	bio?: string;
	status?: string;
	skills?: string[];
	social?: ProfileSocial;
	experience?: Array<Record<string, unknown>>;
	education?: Array<Record<string, unknown>>;
};

type FieldErrors = Record<string, string>;

type ProfileState = {
	profile: Profile | null;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
	fieldErrors: FieldErrors;
};

type RejectValue = {
	message: string;
	fieldErrors?: FieldErrors;
	status?: number;
};

type UpsertProfilePayload = {
	company?: string;
	website?: string;
	location?: string;
	about?: string;
	bio?: string;
	status: string;
	skills: string | string[];
	social?: ProfileSocial;
};

const initialState: ProfileState = {
	profile: null,
	status: 'idle',
	error: null,
	fieldErrors: {},
};

function mapFieldErrors(errors: Array<{ msg: string; path?: string }>) {
	const fieldErrors: FieldErrors = {};
	for (const error of errors) {
		if (!error.path) continue;
		fieldErrors[error.path] = error.msg;
	}
	return fieldErrors;
}

export const getMyProfile = createAsyncThunk<
	Profile,
	void,
	{ rejectValue: RejectValue }
>('profile/getMyProfile', async (_, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.profileMe, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			return rejectWithValue({
				message: data?.msg ?? 'Failed to fetch profile.',
				status: response.status,
			});
		}

		const data = (await response.json()) as Profile;
		return data;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const upsertProfile = createAsyncThunk<
	Profile,
	UpsertProfilePayload,
	{ rejectValue: RejectValue }
>('profile/upsertProfile', async (payload, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.profile, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			const fieldErrors = data?.errors ? mapFieldErrors(data.errors) : {};
			return rejectWithValue({
				message: data?.msg ?? 'Failed to save profile.',
				fieldErrors,
			});
		}

		const data = (await response.json()) as Profile;
		return data;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

const profileSlice = createSlice({
	name: 'profile',
	initialState,
	reducers: {
		clearProfileError: (state) => {
			state.error = null;
		},
		clearProfileFieldError: (state, action: PayloadAction<string>) => {
			delete state.fieldErrors[action.payload];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(getMyProfile.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(getMyProfile.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(getMyProfile.rejected, (state, action) => {
				if (action.payload?.status === 404) {
					state.status = 'succeeded';
					state.profile = null;
					state.error = null;
					return;
				}
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to load profile.';
			})
			.addCase(upsertProfile.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(upsertProfile.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(upsertProfile.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to save profile.';
				state.fieldErrors = action.payload?.fieldErrors ?? {};
			});
	},
});

export const { clearProfileError, clearProfileFieldError } =
	profileSlice.actions;

export default profileSlice.reducer;
