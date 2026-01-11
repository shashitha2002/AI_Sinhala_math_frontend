import React, { useState, useEffect } from 'react';
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { recommendationService } from '../../services/recommendationService';
import { useTranslation } from '../../hooks/useTranslation';
import XAIExplanation from './XAIExplanation';
import enTranslations from '../../i18n/locales/en.json';

interface RecommendationData {
    recommendation: {
        recommended_action: string;
        recommended_topic?: string;
        mastery_level?: number;
        predicted_success_rate?: number;
    };
    goal?: {
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
    };
    xai_explanation?: {
        explanation: string;
        key_factors?: string[];
        confidence?: number;
    };
}

interface AdaptiveRecommendationProps {
    user?: any;
}

const AdaptiveRecommendation: React.FC<AdaptiveRecommendationProps> = ({ user }) => {
    const { t } = useTranslation();
    const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showXAI, setShowXAI] = useState(true);

    useEffect(() => {
        fetchRecommendation();
    }, []);

    const fetchRecommendation = async () => {
        try {
            setLoading(true);
            const response = await recommendationService.getAdaptive(true); // Include XAI
            if (response.data.success) {
                setRecommendation(response.data);
            }
        } catch (error) {
            console.error('Error fetching recommendation:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTopicTranslation = (englishTopic?: string): string => {
        if (!englishTopic) return '';

        // Find the key in en.json that matches the englishTopic
        const topics = (enTranslations as any).topics;
        const topicKey = Object.keys(topics).find(key => topics[key] === englishTopic);

        // If key found, translate it, otherwise return original
        return topicKey ? t(`topics.${topicKey}`) : englishTopic;
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-dominant-800 rounded-lg shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!recommendation || !recommendation.recommendation) {
        return null;
    }

    const rec = recommendation.recommendation;
    const goal = recommendation.goal;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {t('recommendations.title') || 'Your Adaptive Learning Recommendation'}
                </h2>
            </div>

            {/* Goal Card */}
            {goal && (
                <div className="bg-white dark:bg-dominant-800 rounded-lg p-4 mb-4 border-l-4 border-blue-500 dark:border-blue-400">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{goal.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                    <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${goal.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                            goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}>
                            {(t(`recommendations.priority.${goal.priority}`) || goal.priority)} priority
                        </span>
                    </div>
                </div>
            )}

            {/* Recommendation Details */}
            <div className="bg-white dark:bg-dominant-800 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {t('recommendations.recommendedAction') || 'Recommended Action'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.recommended_action}</p>
                    </div>
                </div>

                {rec.recommended_topic && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('recommendations.topic') || 'Topic'}:
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-2">
                            {getTopicTranslation(rec.recommended_topic)}
                        </span>
                    </div>
                )}

                {rec.mastery_level !== undefined && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>{t('recommendations.currentMastery') || 'Current Mastery'}</span>
                            <span>{Math.round(rec.mastery_level * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${rec.mastery_level * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* XAI Explanation */}
            {recommendation.xai_explanation && showXAI && (
                <XAIExplanation
                    explanation={recommendation.xai_explanation}
                    onClose={() => setShowXAI(false)}
                />
            )}

            {/* Toggle XAI */}
            {recommendation.xai_explanation && (
                <button
                    onClick={() => setShowXAI(!showXAI)}
                    className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                >
                    <LightBulbIcon className="h-4 w-4" />
                    {showXAI
                        ? (t('recommendations.hideExplanation') || 'Hide Explanation')
                        : (t('recommendations.showExplanation') || 'Show Explanation')}
                </button>
            )}
        </div>
    );
};

export default AdaptiveRecommendation;
