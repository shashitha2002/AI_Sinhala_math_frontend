import apiClient from './apiClient';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    profile?: {
        school?: string;
        district?: string;
        grade?: string;
        studentId?: string;
    }
}

export const authService = {
    register: (data: RegisterData) => apiClient.post('/auth/signup', data),
    login: (data: LoginData) => {
        const formData = new FormData();
        formData.append('username', data.email); // OAuth2 expects 'username'
        formData.append('password', data.password);

        return apiClient.post('/auth/token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    },
    getMe: () => apiClient.get('/auth/me')
};
