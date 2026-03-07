const API_BASE_URL =
	import.meta.env.VITE_API_URL ||
	(window.location.hostname === 'localhost'
		? 'http://localhost:5000'
		: `http://${window.location.hostname}:5000`);

export const API_ENDPOINTS = {
	register: `${API_BASE_URL}/api/users`,
	login: `${API_BASE_URL}/api/auth`,
	getUser: `${API_BASE_URL}/api/auth`,
	updateUser: `${API_BASE_URL}/api/users/me`,
	profileMe: `${API_BASE_URL}/api/profile/me`,
	profile: `${API_BASE_URL}/api/profile`,
	profileByUserId: (userId: string) =>
		`${API_BASE_URL}/api/profile/user/${userId}`,
	profileExperience: `${API_BASE_URL}/api/profile/experience`,
	profileExperienceById: (expId: string) =>
		`${API_BASE_URL}/api/profile/experience/${expId}`,
	profileEducation: `${API_BASE_URL}/api/profile/education`,
	profileEducationById: (eduId: string) =>
		`${API_BASE_URL}/api/profile/education/${eduId}`,
	profileSkills: `${API_BASE_URL}/api/profile/skills`,
	profileSkillsByIndex: (skillIndex: number) =>
		`${API_BASE_URL}/api/profile/skills/${skillIndex}`,
	posts: `${API_BASE_URL}/api/posts`,
	postById: (postId: string) => `${API_BASE_URL}/api/posts/${postId}`,
	postLike: (postId: string) => `${API_BASE_URL}/api/posts/${postId}/like`,
	postUnlike: (postId: string) => `${API_BASE_URL}/api/posts/${postId}/unlike`,
	postComments: (postId: string) =>
		`${API_BASE_URL}/api/posts/${postId}/comments`,
	postCommentById: (postId: string, commentId: string) =>
		`${API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,

	// Add more endpoints as needed
} as const;

export { API_BASE_URL };
