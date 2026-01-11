import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    AcademicCapIcon,
    ChartBarIcon,
    DocumentTextIcon,
    PlusIcon,
    ArrowRightIcon,
    TrophyIcon,
    FireIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { useProgress } from '../hooks/useProgress';
import { useTranslation } from '../hooks/useTranslation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getTopicKey } from '../utils/topicUtils';
// AdaptiveRecommendation will eventually need to be refactored too, keeping as is for now but TS might complain about .js
// Assuming I can import it or will refactor it soon.
import AdaptiveRecommendation from '../components/Recommendations/AdaptiveRecommendation';

interface DashboardProps {
    user: any; // Define a proper User interface later
}

const DashboardPage: React.FC<DashboardProps> = ({ user }) => {
    const { t } = useTranslation();
    const { getDashboard } = useProgress();
    const [dashboardData, setDashboardData] = useState<any>(null); // Define proper DashboardData interface
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await getDashboard();
            if (data.success) {
                setDashboardData(data.dashboard);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-dominant-900 dark:text-dominant-50">{t('common.loading')}</div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                    {t('errors.somethingWentWrong') || 'Something went wrong'}
                </div>
            </div>
        );
    }

    const recentScores = dashboardData.recentQuizzes
        .slice(0, 5)
        .reverse()
        .map((q: any) => ({
            name: new Date(q.date).toLocaleDateString(),
            score: q.score
        }));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-dominant-900 dark:text-dominant-50 break-words flex items-center gap-2">
                    <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-500 dark:text-accent-400" />
                    {t('dashboard.welcomeBack', { name: user.name })}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-dominant-600 dark:text-dominant-400">{t('dashboard.learningProgress')}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="card card-hover bg-gradient-to-br from-dominant-50 to-dominant-100 dark:from-dominant-900 dark:to-dominant-800 border-dominant-200 dark:border-dominant-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-dominant-600 dark:text-dominant-400">{t('dashboard.totalQuizzes')}</p>
                            <p className="text-3xl font-bold text-dominant-900 dark:text-dominant-50">{dashboardData.totalQuizzes}</p>
                        </div>
                        <div className="p-3 rounded-full bg-dominant-200 dark:bg-dominant-700">
                            <AcademicCapIcon className="h-8 w-8 text-dominant-600 dark:text-dominant-300" />
                        </div>
                    </div>
                </div>

                <div className="card card-hover bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/30 border-success-200 dark:border-success-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-success-700 dark:text-success-400">{t('dashboard.averageScore')}</p>
                            <p className="text-3xl font-bold text-success-900 dark:text-success-300">{dashboardData.averageScore.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 rounded-full bg-success-200 dark:bg-success-800">
                            <ChartBarIcon className="h-8 w-8 text-success-600 dark:text-success-400" />
                        </div>
                    </div>
                </div>

                <div className="card card-hover bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-secondary-700 dark:text-secondary-400">{t('dashboard.currentStreak')}</p>
                            <p className="text-3xl font-bold text-secondary-900 dark:text-secondary-300">{dashboardData.currentStreak} {t('dashboard.days')}</p>
                        </div>
                        <div className="p-3 rounded-full bg-secondary-200 dark:bg-secondary-800">
                            <FireIcon className="h-8 w-8 text-secondary-600 dark:text-secondary-400" />
                        </div>
                    </div>
                </div>

                <div className="card card-hover bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 border-accent-200 dark:border-accent-800">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-accent-700 dark:text-accent-400">{t('dashboard.badgesEarned')}</p>
                            <p className="text-3xl font-bold text-accent-900 dark:text-accent-300">{dashboardData.badges.length}</p>
                        </div>
                        <div className="p-3 rounded-full bg-accent-200 dark:bg-accent-800 ml-2">
                            <TrophyIcon className="h-8 w-8 text-accent-600 dark:text-accent-400" />
                        </div>
                        {dashboardData.badges.length > 0 && (
                            <div className="flex flex-wrap gap-1 ml-2 mt-2 w-full">
                                {dashboardData.badges.slice(0, 3).map((badge: string, idx: number) => (
                                    <span key={idx} className="px-2 py-1 bg-accent-200 dark:bg-accent-800 text-accent-800 dark:text-accent-200 text-xs rounded-full whitespace-nowrap font-medium">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Adaptive Recommendation */}
            <AdaptiveRecommendation user={user} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Link
                    to="/quiz/generate"
                    className="card card-hover bg-gradient-to-br from-dominant-50 to-dominant-100 dark:from-dominant-900 dark:to-dominant-800 border-dominant-200 dark:border-dominant-700 flex items-center justify-between group"
                >
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-dominant-900 dark:text-dominant-50 truncate group-hover:text-dominant-700 dark:group-hover:text-dominant-200">{t('dashboard.takeQuiz')}</h3>
                        <p className="text-xs sm:text-sm text-dominant-600 dark:text-dominant-400 mt-1 line-clamp-2">{t('dashboard.practiceQuestions')}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-dominant-200 dark:bg-dominant-700 group-hover:bg-dominant-300 dark:group-hover:bg-dominant-600 transition-colors">
                        <PlusIcon className="h-6 w-6 sm:h-8 sm:w-8 text-dominant-600 dark:text-dominant-300 flex-shrink-0" />
                    </div>
                </Link>

                <Link
                    to="/quiz/generate?type=model-paper"
                    className="card card-hover bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/30 dark:to-secondary-800/30 border-secondary-200 dark:border-secondary-800 flex items-center justify-between group"
                >
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-secondary-200 truncate group-hover:text-secondary-800 dark:group-hover:text-secondary-100">{t('dashboard.modelPaper')}</h3>
                        <p className="text-xs sm:text-sm text-secondary-700 dark:text-secondary-400 mt-1 line-clamp-2">{t('dashboard.fullExamSimulation')}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary-200 dark:bg-secondary-800 group-hover:bg-secondary-300 dark:group-hover:bg-secondary-700 transition-colors">
                        <DocumentTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-secondary-600 dark:text-secondary-400 flex-shrink-0" />
                    </div>
                </Link>

                <Link
                    to="/forum"
                    className="card card-hover bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 border-accent-200 dark:border-accent-800 flex items-center justify-between group"
                >
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-accent-900 dark:text-accent-200 truncate group-hover:text-accent-800 dark:group-hover:text-accent-100">{t('dashboard.visitForum')}</h3>
                        <p className="text-xs sm:text-sm text-accent-700 dark:text-accent-400 mt-1 line-clamp-2">{t('dashboard.discussWithPeers')}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accent-200 dark:bg-accent-800 group-hover:bg-accent-300 dark:group-hover:bg-accent-700 transition-colors">
                        <ArrowRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-accent-600 dark:text-accent-400 flex-shrink-0" />
                    </div>
                </Link>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Recent Performance */}
                <div className="card overflow-hidden">
                    <h3 className="text-base sm:text-lg font-semibold text-dominant-900 dark:text-dominant-50 mb-4 flex items-center gap-2">
                        <ChartBarIcon className="h-5 w-5 text-dominant-600 dark:text-dominant-400" />
                        {t('dashboard.recentPerformance')}
                    </h3>
                    {recentScores.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={recentScores}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-dominant-500 dark:text-dominant-400 text-center py-8">{t('dashboard.noQuizData')}</p>
                    )}
                </div>

                {/* Topic Performance */}
                <div className="card overflow-hidden">
                    <h3 className="text-base sm:text-lg font-semibold text-dominant-900 dark:text-dominant-50 mb-4 flex items-center gap-2">
                        <AcademicCapIcon className="h-5 w-5 text-dominant-600 dark:text-dominant-400" />
                        {t('dashboard.topicPerformance')}
                    </h3>
                    {dashboardData.topicPerformance.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={dashboardData.topicPerformance.slice(0, 5).map((item: any) => ({
                                ...item,
                                topic: t(`topics.${getTopicKey(item.topic)}`)
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="topic" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Bar dataKey="accuracy" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-dominant-500 dark:text-dominant-400 text-center py-8">{t('dashboard.noTopicData')}</p>
                    )}
                </div>
            </div>

            {/* Recent Quizzes */}
            <div className="card">
                <h3 className="text-base sm:text-lg font-semibold text-dominant-900 dark:text-dominant-50 mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-dominant-600 dark:text-dominant-400" />
                    {t('dashboard.recentQuizzes')}
                </h3>
                {dashboardData.recentQuizzes.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle sm:px-0">
                            <table className="min-w-full divide-y divide-dominant-200 dark:divide-dominant-700">
                                <thead className="bg-dominant-100 dark:bg-dominant-800">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-dominant-700 dark:text-dominant-300 uppercase tracking-wider">
                                            {t('dashboard.date')}
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-dominant-700 dark:text-dominant-300 uppercase tracking-wider">
                                            {t('dashboard.type')}
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-dominant-700 dark:text-dominant-300 uppercase tracking-wider">
                                            {t('dashboard.score')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dominant-900 divide-y divide-dominant-200 dark:divide-dominant-700">
                                    {dashboardData.recentQuizzes.slice(0, 5).map((quiz: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-dominant-50 dark:hover:bg-dominant-800 transition-colors">
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-dominant-900 dark:text-dominant-50">
                                                {new Date(quiz.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-dominant-600 dark:text-dominant-400">
                                                {quiz.type.replace('-', ' ').toUpperCase()}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold ${quiz.score >= 70 ? 'bg-success-100 dark:bg-success-900/50 text-success-800 dark:text-success-300' :
                                                    quiz.score >= 50 ? 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-800 dark:text-secondary-300' :
                                                        'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                                                    }`}>
                                                    {quiz.score.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-dominant-500 dark:text-dominant-400 text-center py-6 sm:py-8 text-sm sm:text-base">{t('dashboard.startByTakingQuiz')}</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
