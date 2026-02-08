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
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('auth.loginFailed') || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dominant-50 px-4 py-12">
            <div className="max-w-md w-full space-y-10">
                <div className="text-center flex flex-col items-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-200">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-dominant-900 tracking-tight mb-2">
                        {t('auth.signIn')}
                    </h2>
                    <p className="text-dominant-600 font-medium opacity-80">
                        AI-Enhanced O/L Math Learning Platform
                    </p>
                </div>

                <div className="card">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                                {error}
                            </div>
                        )}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-dominant-700 mb-2 ml-1">
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
                                <label htmlFor="password" className="block text-sm font-semibold text-dominant-700 mb-2 ml-1">
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
                                className="py-4 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 shadow-lg shadow-accent-200/50 text-white font-bold text-lg transition-all active:scale-[0.98]"
                            >
                                {loading ? t('loading') : t('auth.signIn')}
                            </Button>
                        </div>

                        <div className="text-center pt-2">
                            <Link
                                to="/register"
                                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors"
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
