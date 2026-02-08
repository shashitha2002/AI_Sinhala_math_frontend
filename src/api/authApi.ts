import { apiClient } from './client';

export interface UserSignUp {
    username: string;
    email: string;
    password: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

export async function signUp(user: UserSignUp): Promise<void> {
    await apiClient.post('/auth/signup', user);
}

export async function login(formData: FormData): Promise<Token> {
    const { data } = await apiClient.post<Token>('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return data;
}
