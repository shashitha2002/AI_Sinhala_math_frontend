import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import type { LoginData, RegisterData } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    setLoading(true);
                    const response = await authService.getMe();
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (err) {
                    console.error('Failed to fetch user:', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUser();
    }, []);

    const login = useCallback(async (data: LoginData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register(data);
            const { access_token, user } = response.data;
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    }, []);

    return { user, loading, error, login, register, logout };
};
