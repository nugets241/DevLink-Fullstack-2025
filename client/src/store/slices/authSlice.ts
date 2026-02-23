import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../config/api';

type User = {
	id: string;
	name: string;
	email: string;
	avatar?: string;
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

type LoginPayload = {
	email: string;
	password: string;
};

type RejectValue = {
	message: string;
	fieldErrors?: FieldErrors;
	status?: number;
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

export const loginUser = createAsyncThunk<
	{ token?: string; user?: User },
	LoginPayload,
	{ rejectValue: RejectValue }
>('auth/loginUser', async (payload, { rejectWithValue }) => {
	try {
		const response = await fetch(API_ENDPOINTS.login, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			const fieldErrors: FieldErrors = {};
			if (data?.errors) {
				for (const error of data.errors) {
					if (error.path === 'email') fieldErrors.email = error.msg;
					if (error.path === 'password') fieldErrors.password = error.msg;
				}
			}

			console.error('Login failed:', fieldErrors, data);

			return rejectWithValue({
				message: data?.msg ?? 'Login failed.',
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

export const getUserData = createAsyncThunk<
	User,
	void,
	{ rejectValue: RejectValue }
>('auth/getUserData', async (_, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.getUser, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			return rejectWithValue({
				message: data?.msg ?? 'Failed to fetch user data.',
				status: response.status,
			});
		}

		const data = (await response.json()) as User;
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
		logout: (state) => {
			state.user = null;
			state.token = null;
			state.status = 'idle';
			state.error = null;
			state.fieldErrors = {};
			localStorage.removeItem('token');
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
			})
			.addCase(loginUser.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.token = action.payload.token ?? null;
				state.user = action.payload.user ?? null;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Login failed.';
				state.fieldErrors = action.payload?.fieldErrors ?? {};
			})
			.addCase(getUserData.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(getUserData.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.user = action.payload;
			})
			.addCase(getUserData.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to load user data.';
			});
	},
});

export const { clearAuthError, clearFieldError, logout } = authSlice.actions;

export default authSlice.reducer;
