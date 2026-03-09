import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const STRESS_URL = import.meta.env.VITE_STRESS_URL || 'http://localhost:5000/stress';

const stressClient: AxiosInstance = axios.create({
    baseURL: STRESS_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default stressClient;