import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import type { LoginData, RegisterData } from '../services/authService';

export const useAuth = () => {
    const [user, setUser] = useState<any>(() => {
        // Load user from localStorage on init
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (data: LoginData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            const { access_token } = response.data;

            // Store token
            localStorage.setItem('token', access_token);

            // Store minimal user data (email from login form)
            const userData = { email: data.email };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

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
            // Step 1: Register the user (backend returns only success message)
            await authService.register(data);

            // Step 2: Automatically login after successful registration
            const loginResponse = await authService.login({
                email: data.email,
                password: data.password
            });

            const { access_token } = loginResponse.data;

            // Store token
            localStorage.setItem('token', access_token);

            // Store minimal user data
            const userData = { email: data.email, username: data.username };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            return loginResponse.data;
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

