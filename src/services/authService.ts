import apiClient from './apiClient';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    // Add other registration fields as needed
}

export const authService = {
    register: (data: RegisterData) => apiClient.post('/auth/register', data),
    login: (data: LoginData) => apiClient.post('/auth/login', data),
    getMe: () => apiClient.get('/auth/me')
};
