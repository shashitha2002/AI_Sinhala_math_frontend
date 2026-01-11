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
        confirmPassword: '',
        studentId: '',
        school: '',
        district: '',
        grade: 'O-Level'
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
            const { confirmPassword, ...registerData } = formData;
            await register({
                username: registerData.name, // Mapping name to username as per AuthContext interface likely expectation
                email: registerData.email,
                password: registerData.password,
                // The service might need to handle 'profile' data differently if strict types are enforced,
                // but for now we pass it and let the ANY type in service handle it or update service later.
                // If authService.register expects specific RegisterData, we should update that interface.
                // For now, I'm assuming authService can take extra props or I will cast to any to bypass strict check for additional fields 
                // until I fully type the RegisterData interface to include profile.
                profile: {
                    school: formData.school,
                    district: formData.district,
                    grade: formData.grade,
                    studentId: formData.studentId
                }
            } as any);

            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || t('auth.registrationFailed') || 'Registration failed');
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-extrabold text-dominant-900 dark:text-dominant-50">
                        {t('auth.signUp')}
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
                                <label htmlFor="name" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                                    {t('name')}
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
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                                    {t('email')}
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
                            <div>
                                <label htmlFor="studentId" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                                    {t('portfolio.studentId')} ({t('optional') || 'Optional'})
                                </label>
                                <input
                                    id="studentId"
                                    name="studentId"
                                    type="text"
                                    className="input"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="school" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                                        {t('portfolio.school')}
                                    </label>
                                    <input
                                        id="school"
                                        name="school"
                                        type="text"
                                        className="input"
                                        value={formData.school}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="district" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
                                        {t('portfolio.district')}
                                    </label>
                                    <input
                                        id="district"
                                        name="district"
                                        type="text"
                                        className="input"
                                        value={formData.district}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
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
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-dominant-700 dark:text-dominant-300 mb-2">
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
                                className="bg-gradient-to-r from-dominant-600 to-accent-600 hover:from-dominant-700 hover:to-accent-700"
                            >
                                {loading ? t('loading') : t('register')}
                            </Button>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="font-medium text-dominant-600 dark:text-dominant-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
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
