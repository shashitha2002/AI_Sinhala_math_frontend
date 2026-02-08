import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMathQuiz } from '../hooks/useMathQuiz';
import type { QuizHistoryItem } from '../services/mathQuizService';

const QuizHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { getQuizHistory, getQuizStats, deleteQuiz, loading } = useMathQuiz();

    const [quizzes, setQuizzes] = useState<QuizHistoryItem[]>([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState<QuizHistoryItem[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterTopic, setFilterTopic] = useState<string>('all');

    useEffect(() => {
        loadQuizHistory();
        loadStats();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [quizzes, filterStatus, filterTopic]);

    const loadQuizHistory = async () => {
        const history = await getQuizHistory({ limit: 100 });
        setQuizzes(history);
    };

    const loadStats = async () => {
        const statistics = await getQuizStats();
        setStats(statistics);
    };

    const applyFilters = () => {
        let filtered = [...(quizzes || [])];

        if (filterStatus !== 'all') {
            filtered = filtered.filter(q => q.status === filterStatus);
        }

        if (filterTopic !== 'all') {
            filtered = filtered.filter(q => q.topic === filterTopic);
        }

        setFilteredQuizzes(filtered);
    };

    const handleQuizClick = (quiz: QuizHistoryItem) => {
        if (quiz.status === 'completed') {
            // Navigate to results view
            navigate(`/quiz/results/${quiz.id}`);
        } else if (quiz.status === 'in-progress' || quiz.status === 'not-started') {
            // Navigate to quiz taking with quiz ID
            navigate(`/quiz/take/${quiz.id}`);
        }
    };

    const handleDeleteQuiz = async (quizId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            const success = await deleteQuiz(quizId);
            if (success) {
                loadQuizHistory();
            }
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const formatDate = (date?: Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const badges: any = {
            'completed': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', label: 'Completed' },
            'in-progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', label: 'In Progress' },
            'not-started': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', label: 'Not Started' },
            'abandoned': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', label: 'Abandoned' }
        };
        const badge = badges[status] || badges['not-started'];
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getDifficultyBadge = (difficulty: string) => {
        const badges: any = {
            'easy': { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', label: 'පහසු' },
            'medium': { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', label: 'මධ්‍යම' },
            'hard': { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', label: 'අපහසු' }
        };
        const badge = badges[difficulty] || badges['medium'];
        return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const uniqueTopics = Array.from(new Set((quizzes || []).map(q => q.topic)));

    const inProgressQuizzes = filteredQuizzes.filter(q => q.status === 'in-progress' || q.status === 'not-started');
    const completedQuizzes = filteredQuizzes.filter(q => q.status === 'completed');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dominant-900">
            {/* Header */}
            <header className="bg-primary-600 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">ප්‍රශ්න පත්‍ර ඉතිහාසය</h1>
                            <p className="text-primary-100 mt-1">Quiz History</p>
                        </div>
                        <button
                            onClick={() => navigate('/quiz/generate')}
                            className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                        >
                            + නව ප්‍රශ්න පත්‍රයක්
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Quizzes</div>
                            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.totalQuizzes}</div>
                        </div>
                        <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{Math.round(stats.averageScore)}%</div>
                        </div>
                        <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Questions</div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalQuestions}</div>
                        </div>
                        <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-md p-6">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Spent</div>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {Math.round(stats.totalTimeSpent / 60)}m
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status Filter
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-dominant-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dominant-700 dark:text-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="not-started">Not Started</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Topic Filter
                            </label>
                            <select
                                value={filterTopic}
                                onChange={(e) => setFilterTopic(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-dominant-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dominant-700 dark:text-white"
                            >
                                <option value="all">All Topics</option>
                                {uniqueTopics.map(topic => (
                                    <option key={topic} value={topic}>{topic}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* In Progress Quizzes */}
                {inProgressQuizzes.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                            📝 In Progress ({inProgressQuizzes.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inProgressQuizzes.map(quiz => (
                                <div
                                    key={quiz.id}
                                    onClick={() => handleQuizClick(quiz)}
                                    className="bg-white dark:bg-dominant-800 rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden border-2 border-blue-200 dark:border-blue-800"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                    {quiz.topic}
                                                </h3>
                                                {quiz.topicEnglish && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{quiz.topicEnglish}</p>
                                                )}
                                            </div>
                                            {getDifficultyBadge(quiz.difficulty)}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Questions:</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">{quiz.questionsCount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {formatDate(quiz.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            {getStatusBadge(quiz.status)}
                                            <button
                                                onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Quizzes */}
                {completedQuizzes.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                            ✅ Completed ({completedQuizzes.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedQuizzes.map(quiz => (
                                <div
                                    key={quiz.id}
                                    onClick={() => handleQuizClick(quiz)}
                                    className="bg-white dark:bg-dominant-800 rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                    {quiz.topic}
                                                </h3>
                                                {quiz.topicEnglish && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{quiz.topicEnglish}</p>
                                                )}
                                            </div>
                                            {getDifficultyBadge(quiz.difficulty)}
                                        </div>

                                        {quiz.score && (
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
                                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                        {quiz.score.percentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-dominant-700 rounded-full h-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${quiz.score.percentage}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    <span>{quiz.score.correctAnswers}/{quiz.score.totalQuestions} correct</span>
                                                    <span>{formatDuration(quiz.totalTimeSpent)}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Completed: {formatDate(quiz.timeCompleted)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredQuizzes.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            No quizzes found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Start by generating a new quiz!
                        </p>
                        <button
                            onClick={() => navigate('/quiz/generate')}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Generate Quiz
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading quiz history...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizHistoryPage;
