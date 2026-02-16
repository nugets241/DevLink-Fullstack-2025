const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
	register: `${API_BASE_URL}/api/users`,
	login: `${API_BASE_URL}/api/auth`,
	getUser: `${API_BASE_URL}/api/auth`,
	// Add more endpoints as needed
} as const;

export { API_BASE_URL };
