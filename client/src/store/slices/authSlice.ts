import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api';

type User = {
	id: string;
	name: string;
	email: string;
};

type FieldErrors = {
	name?: string;
	email?: string;
	password?: string;
};

type FieldErrorKey = keyof FieldErrors;

type AuthState = {
	user: User | null;
	token: string | null;
	status: 'idle' | 'loading' | 'succeeded' | 'failed';
	error: string | null;
	fieldErrors: FieldErrors;
};

type RegisterPayload = {
	name: string;
	email: string;
	password: string;
};

type RejectValue = {
	message: string;
	fieldErrors?: FieldErrors;
};

const initialState: AuthState = {
	user: null,
	token: localStorage.getItem('token'),
	status: 'idle',
	error: null,
	fieldErrors: {},
};

export const registerUser = createAsyncThunk<
	{ token?: string; user?: User },
	RegisterPayload,
	{ rejectValue: RejectValue }
>('auth/registerUser', async (payload, { rejectWithValue }) => {
	try {
		const response = await fetch(API_ENDPOINTS.register, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			const fieldErrors: FieldErrors = {};
			if (data?.errors) {
				for (const error of data.errors) {
					if (error.path === 'name') fieldErrors.name = error.msg;
					if (error.path === 'email') fieldErrors.email = error.msg;
					if (error.path === 'password') fieldErrors.password = error.msg;
				}
			}

			return rejectWithValue({
				message: data?.msg ?? 'Registration failed.',
				fieldErrors,
			});
		}

		const data = (await response.json()) as { token?: string; user?: User };
		if (data.token) localStorage.setItem('token', data.token);
		return data;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		clearAuthError: (state) => {
			state.error = null;
		},
		clearFieldError: (state, action: PayloadAction<FieldErrorKey>) => {
			delete state.fieldErrors[action.payload];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(registerUser.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.token = action.payload.token ?? null;
				state.user = action.payload.user ?? null;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Registration failed.';
				state.fieldErrors = action.payload?.fieldErrors ?? {};
			});
	},
});

export const { clearAuthError, clearFieldError } = authSlice.actions;

export default authSlice.reducer;
