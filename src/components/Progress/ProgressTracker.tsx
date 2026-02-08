import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import { useTranslation } from '../../hooks/useTranslation';
import { useMathQuiz } from '../../hooks/useMathQuiz';
import Button from '../UI/Button';
import BadgesDisplay from '../Badges/BadgesDisplay';
import ActivityCalendar from '../Games/ActivityCalendar';
import { getTopicKey } from '../../utils/topicUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
    totalQuizzes: number;
    averageScore: number;
    currentStreak: number;
    totalTimeSpent: number;
    recentQuizzes: {
        date: string;
        type: string;
        topic: string;
        score: number;
    }[];
    topicPerformance: {
        topic: string;
        accuracy: number;
    }[];
    mastery: {
        topic: string;
        mastery: number;
    }[];
}

interface ProgressTrackerProps {
    user: any;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { getQuizHistory } = useMathQuiz();

    const getTopicTranslation = (topicName: string): string => {
        const key = getTopicKey(topicName);
        return key ? t(`topics.${key}`) : topicName;
    };
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [mathQuizzes, setMathQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch regular progress data
            const response = await progressService.getDashboard();
            if (response.data && response.data.success) {
                setDashboardData(response.data.dashboard);
            }

            // Fetch math quiz history
            const mathQuizHistory = await getQuizHistory({ limit: 10 });
            setMathQuizzes(Array.isArray(mathQuizHistory) ? mathQuizHistory : []);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</div>
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('progress.yourProgress') || 'Your Progress'}</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('progress.trackJourney') || 'Track your learning journey'}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.totalQuizzes') || 'Total Quizzes'}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.totalQuizzes}</p>
                </div>
                <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.averageScore') || 'Average Score'}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{(dashboardData.averageScore || 0).toFixed(1)}%</p>
                </div>
                <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.currentStreak') || 'Current Streak'}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dashboardData.currentStreak} {t('dashboard.days') || 'days'}</p>
                </div>
                <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('progress.totalTime') || 'Total Time'}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{(dashboardData.totalTimeSpent || 0).toFixed(1)} {t('progress.minutes') || 'min'}</p>
                </div>
            </div>

            {/* Badges Row (Scrollable) */}
            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6 mb-8 transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('progress.badgesEarned') || 'Badges Earned'}</h2>
                    <Link to="/badges" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                        View All →
                    </Link>
                </div>
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    <BadgesDisplay userId={user._id} showAll={false} />
                </div>
            </div>

            {/* Calendar and Recent Quizzes Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Activity Calendar (Takes 1/3 width) */}
                <div className="lg:col-span-1">
                    <ActivityCalendar userId={user._id} />
                </div>

                {/* Recent Quizzes Table (Takes 2/3 width) */}
                <div className="lg:col-span-2 bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-4 sm:p-6 h-full flex flex-col overflow-hidden transition-colors">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('progress.recentQuizResults') || 'Recent Results'}</h2>
                    {dashboardData.recentQuizzes?.length > 0 ? (
                        <div className="overflow-x-auto -mx-4 sm:mx-0 flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                            <div className="inline-block min-w-full align-middle sm:px-0">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                        <tr>
                                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('dashboard.date') || 'Date'}</th>
                                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('dashboard.type') || 'Type'}</th>
                                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('dashboard.topic') || 'Topic'}</th>
                                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{t('dashboard.score') || 'Score'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-dominant-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {dashboardData.recentQuizzes.map((quiz, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                                                    {new Date(quiz.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                    {t(`quiz.types.${quiz.type}`, quiz.type.replace('-', ' ').toUpperCase())}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                    {getTopicTranslation(quiz.topic) || quiz.topic}
                                                </td>
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                                    <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold ${quiz.score >= 70 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                                        quiz.score >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                                            'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                                        }`}>
                                                        {(quiz.score || 0).toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('progress.noQuizHistory') || 'No quiz history yet.'}</p>
                    )}
                </div>
            </div>

            {/* Math Quiz History Section */}
            {mathQuizzes.length > 0 && (
                <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                            📝 සිංහල ගණිත ප්‍රශ්න පත්‍ර (Math Quizzes)
                        </h2>
                        <Link
                            to="/quiz/history"
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                            View All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mathQuizzes.slice(0, 6).map((quiz) => (
                            <div
                                key={quiz.id}
                                onClick={() => {
                                    if (quiz.status === 'completed') {
                                        navigate(`/quiz/history`);
                                    } else {
                                        navigate('/math-quiz', { state: { resumeQuizId: quiz.id } });
                                    }
                                }}
                                className="bg-gray-50 dark:bg-dominant-700 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary-500"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                        {quiz.topic}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${quiz.status === 'completed'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                        }`}>
                                        {quiz.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Difficulty:</span>
                                        <span className="font-medium">{quiz.difficulty}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Questions:</span>
                                        <span className="font-medium">{quiz.questionsCount}</span>
                                    </div>
                                    {quiz.status === 'completed' && quiz.score && (
                                        <div className="flex justify-between">
                                            <span>Score:</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                {quiz.score.percentage}%
                                            </span>
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                        {new Date(quiz.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {mathQuizzes.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No math quizzes generated yet. Start by generating a quiz!
                        </p>
                    )}
                </div>
            )}

            {/* Topic Performance Chart */}
            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 overflow-hidden transition-colors">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('progress.topicPerformance') || 'Topic Performance'}</h2>
                {dashboardData.topicPerformance?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dashboardData.topicPerformance.map(item => ({
                            ...item,
                            topic: getTopicTranslation(item.topic)
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="topic" className="text-xs" tick={{ fill: 'currentColor' }} />
                            <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: 'currentColor' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgb(31, 41, 55)', borderColor: 'rgb(55, 65, 81)', color: 'white' }} />
                            <Bar dataKey="accuracy" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">{t('dashboard.noTopicData') || 'No topic data available'}</p>
                )}
            </div>

            {/* Topic Mastery */}
            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('progress.topicMastery') || 'Topic Mastery'}</h2>
                {dashboardData.mastery && dashboardData.mastery.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {dashboardData.mastery.map((topic, idx) => (
                            <div key={idx} className="mb-3 sm:mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{getTopicTranslation(topic.topic) || t('forum.unknown') || 'Unknown'}</span>
                                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{(topic.mastery || 0).toFixed(2)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3">
                                    <div
                                        className={`h-2 sm:h-3 rounded-full transition-all ${topic.mastery >= 70 ? 'bg-green-500' :
                                            topic.mastery >= 50 ? 'bg-yellow-500' :
                                                'bg-red-500'
                                            }`}
                                        style={{ width: `${topic.mastery || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('progress.noMasteryData') || 'No mastery data available'}</p>
                )}
            </div>

            {/* Portfolio Link */}
            <div className="mt-6 sm:mt-8 text-center">
                <Link to="/portfolio">
                    <Button variant="primary" size="lg">
                        {t('progress.viewPortfolio') || 'View Portfolio'}
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ProgressTracker;
