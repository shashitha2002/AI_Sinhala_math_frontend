import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../hooks/useAuth';
import { useMathQuiz } from '../../hooks/useMathQuiz';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
    totalQuizzes: number;
    averageScore: number;
    currentStreak: number;
    badges: any[];
    recentQuizzes: any[];
    topicPerformance: any[];
}

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getQuizHistory } = useMathQuiz();

    const [data, setData] = useState<DashboardData | null>(null);
    const [mathQuizzes, setMathQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch regular dashboard data
                const response = await progressService.getDashboard();
                if (response.data.success) {
                    setData(response.data.dashboard);
                }

                // Fetch math quiz history
                const mathQuizHistory = await getQuizHistory({ limit: 6 });
                setMathQuizzes(mathQuizHistory);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading your progress...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.username || 'Student'}!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Here's your learning progress</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Quizzes</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{data?.totalQuizzes || 0}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="text-2xl">🎓</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Score</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{data?.averageScore || 0}%</h3>
                        </div>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{data?.currentStreak || 0} days</h3>
                        </div>
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <span className="text-2xl">🔥</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Badges Earned</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{data?.badges?.length || 0}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <span className="text-2xl">🏆</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Topic Performance</h3>
                    <div className="h-64">
                        {data?.topicPerformance && data.topicPerformance.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.topicPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="topic" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available</div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    {data?.recentQuizzes && data.recentQuizzes.length > 0 ? (
                        <div className="space-y-4">
                            {data.recentQuizzes.map((quiz, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{quiz.topic}</p>
                                        <p className="text-sm text-gray-500">{new Date(quiz.date).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`font-bold ${quiz.score >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                                        {Math.round(quiz.score)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">No recent quizzes</div>
                    )}
                </div>
            </div>

            {/* Math Quiz History Section */}
            {mathQuizzes.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            📝 සිංහල ගණිත ප්‍රශ්න පත්‍ර (Math Quizzes)
                        </h3>
                        <button
                            onClick={() => navigate('/quiz/history')}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            View All →
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mathQuizzes.map((quiz) => (
                            <div
                                key={quiz.id}
                                onClick={() => {
                                    if (quiz.status === 'completed') {
                                        navigate('/quiz/history');
                                    } else {
                                        navigate('/math-quiz', { state: { resumeQuizId: quiz.id } });
                                    }
                                }}
                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {quiz.topic}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${quiz.status === 'completed'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                        }`}>
                                        {quiz.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
