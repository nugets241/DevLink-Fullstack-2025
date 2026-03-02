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

type Experience = {
	id?: string;
	_id?: string;
	title: string;
	company: string;
	location?: string;
	from: string;
	to?: string;
	current?: boolean;
	description?: string;
};

type Education = {
	id?: string;
	_id?: string;
	school: string;
	degree: string;
	fieldofstudy: string;
	location?: string;
	from: string;
	to?: string;
	current?: boolean;
	description?: string;
};

type Profile = {
	_id?: string;
	user?: ProfileUser;
	company?: string;
	website?: string;
	location?: string;
	about?: string;
	status?: string;
	skills?: string[];
	social?: ProfileSocial;
	experience?: Experience[];
	education?: Education[];
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
	status: string;
	skills: string | string[];
	social?: ProfileSocial;
};

type AddExperiencePayload = {
	title: string;
	company: string;
	location?: string;
	from: string;
	to?: string;
	current?: boolean;
	description?: string;
};

type UpdateExperiencePayload = AddExperiencePayload & {
	experienceId: string;
};

type AddEducationPayload = {
	school: string;
	degree: string;
	fieldofstudy: string;
	from: string;
	to?: string;
	current?: boolean;
	description?: string;
};

type UpdateEducationPayload = AddEducationPayload & {
	educationId: string;
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

export const addExperience = createAsyncThunk<
	Profile,
	AddExperiencePayload,
	{ rejectValue: RejectValue }
>('profile/addExperience', async (payload, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.profileExperience, {
			method: 'PUT',
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
				message: data?.msg ?? 'Failed to add experience.',
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

export const deleteExperience = createAsyncThunk<
	Profile,
	string,
	{ rejectValue: RejectValue }
>('profile/deleteExperience', async (experienceId, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(
			API_ENDPOINTS.profileExperienceById(experienceId),
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			return rejectWithValue({
				message: data?.msg ?? 'Failed to delete experience.',
			});
		}

		const data = (await response.json()) as Profile;
		return data;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const updateExperience = createAsyncThunk<
	Profile,
	UpdateExperiencePayload,
	{ rejectValue: RejectValue }
>('profile/updateExperience', async (payload, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const { experienceId, ...body } = payload;
		const response = await fetch(
			API_ENDPOINTS.profileExperienceById(experienceId),
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			},
		);

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			const fieldErrors = data?.errors ? mapFieldErrors(data.errors) : {};
			return rejectWithValue({
				message: data?.msg ?? 'Failed to update experience.',
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

export const addEducation = createAsyncThunk<
	Profile,
	AddEducationPayload,
	{ rejectValue: RejectValue }
>('profile/addEducation', async (payload, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(API_ENDPOINTS.profileEducation, {
			method: 'PUT',
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
				message: data?.msg ?? 'Failed to add education.',
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

export const deleteEducation = createAsyncThunk<
	Profile,
	string,
	{ rejectValue: RejectValue }
>('profile/deleteEducation', async (educationId, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const response = await fetch(
			API_ENDPOINTS.profileEducationById(educationId),
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			return rejectWithValue({
				message: data?.msg ?? 'Failed to delete education.',
			});
		}

		const data = (await response.json()) as Profile;
		return data;
	} catch (error) {
		console.error(error);
		return rejectWithValue({ message: 'Network error. Please try again.' });
	}
});

export const updateEducation = createAsyncThunk<
	Profile,
	UpdateEducationPayload,
	{ rejectValue: RejectValue }
>('profile/updateEducation', async (payload, { rejectWithValue }) => {
	try {
		const token = localStorage.getItem('token');
		if (!token) {
			return rejectWithValue({ message: 'No token found.' });
		}

		const { educationId, ...body } = payload;
		const response = await fetch(
			API_ENDPOINTS.profileEducationById(educationId),
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			},
		);

		if (!response.ok) {
			const data = await response.json().catch(() => null);
			const fieldErrors = data?.errors ? mapFieldErrors(data.errors) : {};
			return rejectWithValue({
				message: data?.msg ?? 'Failed to update education.',
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
		clearProfileErrors: (state) => {
			state.error = null;
			state.fieldErrors = {};
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
			})
			.addCase(addExperience.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(addExperience.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(addExperience.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to add experience.';
				state.fieldErrors = action.payload?.fieldErrors ?? {};
			})
			.addCase(deleteExperience.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(deleteExperience.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(deleteExperience.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to delete experience.';
			})
			.addCase(updateExperience.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(updateExperience.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(updateExperience.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to update experience.';
				state.fieldErrors = action.payload?.fieldErrors ?? {};
			})
			.addCase(addEducation.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(addEducation.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(addEducation.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to add education.';
				state.fieldErrors = action.payload?.fieldErrors ?? {};
			})
			.addCase(deleteEducation.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(deleteEducation.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(deleteEducation.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to delete education.';
			})
			.addCase(updateEducation.pending, (state) => {
				state.status = 'loading';
				state.error = null;
				state.fieldErrors = {};
			})
			.addCase(updateEducation.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.profile = action.payload;
			})
			.addCase(updateEducation.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload?.message ?? 'Failed to update education.';
				state.fieldErrors = action.payload?.fieldErrors ?? {};
			});
	},
});

export const { clearProfileError, clearProfileErrors, clearProfileFieldError } =
	profileSlice.actions;

export default profileSlice.reducer;
