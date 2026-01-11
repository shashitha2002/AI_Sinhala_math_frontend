import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { progressService } from '../../services/progressService';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '../UI/Button';
import { generatePortfolioPDF } from '../../utils/pdfGenerator';

interface PortfolioData {
    studentInfo: {
        name: string;
        studentId: string;
        school: string;
        district: string;
        grade: string;
    };
    academicSummary: {
        totalQuizzes: number;
        averageScore: number;
        bestScore: number;
        modelPapersCompleted: number;
        adaptiveQuizzesCompleted: number;
        totalTimeSpent: number;
    };
    badges: string[];
    strengths: string[];
    areasForImprovement: string[];
    topicMastery: {
        topic: string;
        mastery: number;
        questionsAttempted: number;
    }[];
    generatedAt: string;
}

interface PortfolioProps {
    user?: any;
}

const Portfolio: React.FC<PortfolioProps> = ({ user }) => {
    const { t } = useTranslation();
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const response = await progressService.getPortfolio();
            if (response.data && response.data.success) {
                setPortfolio(response.data.portfolio);
            }
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (portfolio) {
            generatePortfolioPDF(portfolio, t);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600 dark:text-gray-400">{t('loading') || 'Loading...'}</div>
            </div>
        );
    }

    if (!portfolio) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                    Failed to generate portfolio
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Link
                    to="/progress"
                    className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm sm:text-base"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    {t('forum.backToForum') || 'Back'}
                </Link>
                <Button
                    onClick={handleDownload}
                    variant="primary"
                    className="inline-flex items-center"
                >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    {t('portfolio.downloadPortfolio') || 'Download Portfolio'}
                </Button>
            </div>

            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-4 sm:p-8 transition-colors">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 text-center">
                    {t('portfolio.portfolioTitle') || 'Performance Portfolio'}
                </h1>

                {/* Student Information */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
                        {t('portfolio.studentInformation') || 'Student Information'}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('name') || 'Name'}</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-200">{portfolio.studentInfo.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.studentId') || 'Student ID'}</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-200">{portfolio.studentInfo.studentId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.school') || 'School'}</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-200">{portfolio.studentInfo.school}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.district') || 'District'}</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-200">{portfolio.studentInfo.district}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.grade') || 'Grade'}</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-200">{portfolio.studentInfo.grade}</p>
                        </div>
                    </div>
                </section>

                {/* Academic Summary */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
                        {t('portfolio.academicSummary') || 'Academic Summary'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.totalQuizzes') || 'Total Quizzes'}</p>
                            <p className="text-2xl font-bold text-primary-900 dark:text-primary-300">
                                {portfolio.academicSummary.totalQuizzes}
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.averageScore') || 'Average Score'}</p>
                            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                                {portfolio.academicSummary.averageScore}%
                            </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.bestScore') || 'Best Score'}</p>
                            <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                                {portfolio.academicSummary.bestScore}%
                            </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Model Papers</p>
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                                {portfolio.academicSummary.modelPapersCompleted}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Adaptive Quizzes</p>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                {portfolio.academicSummary.adaptiveQuizzesCompleted}
                            </p>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
                            <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">
                                {portfolio.academicSummary.totalTimeSpent} min
                            </p>
                        </div>
                    </div>
                </section>

                {/* Badges */}
                {portfolio.badges.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
                            Badges Earned
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {portfolio.badges.map((badge, idx) => (
                                <div
                                    key={idx}
                                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium"
                                >
                                    🏆 {badge.toUpperCase()}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Strengths */}
                {portfolio.strengths.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
                            Strengths
                        </h2>
                        <ul className="list-disc list-inside space-y-2">
                            {portfolio.strengths.map((strength, idx) => (
                                <li key={idx} className="text-lg text-gray-700 dark:text-gray-300">
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Areas for Improvement */}
                {portfolio.areasForImprovement.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
                            Areas for Improvement
                        </h2>
                        <ul className="list-disc list-inside space-y-2">
                            {portfolio.areasForImprovement.map((area, idx) => (
                                <li key={idx} className="text-lg text-gray-700 dark:text-gray-300">
                                    {area}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Topic Mastery */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-2">
                        Topic Mastery
                    </h2>
                    <div className="space-y-4">
                        {portfolio.topicMastery.slice(0, 10).map((topic, idx) => (
                            <div key={idx} className="mb-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic.topic}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {Math.round(topic.mastery)}% ({topic.questionsAttempted} questions)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${topic.mastery >= 70 ? 'bg-green-500' :
                                                topic.mastery >= 50 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                            }`}
                                        style={{ width: `${topic.mastery}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                    Generated on {new Date(portfolio.generatedAt).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
