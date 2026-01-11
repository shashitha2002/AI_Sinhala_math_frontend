import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthContext } from '../contexts/AuthContext';
import Button from '../components/UI/Button';

const LoginPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuthContext();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData);
            // Navigation is handled in App.tsx via <Navigate> if user is present, 
            // or we can explicitly navigate here.
            // Since App.tsx redirects if (user), we might not need to do anything, 
            // but explicit navigate is safer.
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || t('auth.loginFailed') || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dominant-50 dark:bg-dominant-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-full bg-gradient-to-br from-dominant-500 to-accent-500">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-dominant-900 dark:text-dominant-50">
                        {t('auth.signIn')}
                    </h2>
                    <p className="mt-2 text-sm text-dominant-600 dark:text-dominant-400">
                        AI-Enhanced O/L Math Learning Platform
                    </p>
                </div>
                <div className="card">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                                    {t('auth.emailAddress')}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input"
                                    placeholder={t('auth.emailAddress')}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                                    {t('auth.password')}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input"
                                    placeholder={t('auth.password')}
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading}
                                fullWidth
                                className="bg-gradient-to-r from-dominant-600 to-accent-600 hover:from-dominant-700 hover:to-accent-700"
                            >
                                {loading ? t('loading') : t('auth.signIn')}
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/register"
                                className="font-medium text-dominant-600 dark:text-dominant-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                            >
                                {t('auth.dontHaveAccount')}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
