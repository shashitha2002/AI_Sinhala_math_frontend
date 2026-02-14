import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuthContext } from '../contexts/AuthContext';
import Button from '../components/UI/Button';

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register } = useAuthContext();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.passwordsNotMatch') || 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError(t('auth.passwordMinLength') || 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                username: formData.name,
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || err.response?.data?.message || t('auth.registrationFailed') || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dominant-50 px-4 py-12">
            <div className="max-w-xl w-full space-y-10">
                <div className="text-center flex flex-col items-center">
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-200">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold text-dominant-900 tracking-tight mb-2">
                        {t('auth.signUp')}
                    </h2>
                    <p className="text-dominant-600 font-medium opacity-80">
                        Join our AI-Enhanced O/L Math Learning Platform
                    </p>
                </div>

                <div className="card">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="block text-sm font-semibold text-dominant-700 ml-1">
                                    {t('common.name')}
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className="input"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-dominant-700 ml-1">
                                    {t('common.email')}
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="input"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-dominant-700 ml-1">
                                    {t('auth.password')}
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="input"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-dominant-700 ml-1">
                                    {t('auth.confirmPassword')}
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="input"
                                    value={formData.confirmPassword}
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
                                {loading ? t('common.loading') : t('common.register')}
                            </Button>
                        </div>

                        <div className="text-center pt-2">
                            <Link
                                to="/login"
                                className="font-semibold text-accent-600 hover:text-accent-700 transition-colors"
                            >
                                {t('auth.alreadyHaveAccount')}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
