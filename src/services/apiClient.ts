import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});


// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error
            if (error.response.status === 401) {
                // Unauthorized - clear token and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } else if (error.request) {
            // Request made but no response
            console.error('Network error:', error.request);
        } else {
            // Something else happened
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
