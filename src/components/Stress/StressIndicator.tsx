import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { stressService } from '../../services/stressService';
import { useTranslation } from '../../hooks/useTranslation';

interface StressData {
    stressLevel: number;
    recommendation: string;
    motivationalMessage: string;
}

interface StressIndicatorProps {
    userId?: string;
}

const StressIndicator: React.FC<StressIndicatorProps> = ({ userId }) => {
    const { t } = useTranslation();
    const [stressData, setStressData] = useState<StressData | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Analyze stress periodically (every 30 minutes)
        analyzeStress();
        const interval = setInterval(analyzeStress, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const analyzeStress = async () => {
        try {
            // Track time spent (this would ideally be tracked from user activity)
            const timeSpentToday = 0; // Placeholder - should be calculated from session data

            const response = await stressService.analyze({
                timeSpentToday
            });

            if (response.data.success) {
                setStressData(response.data);
            }
        } catch (error) {
            console.error('Error analyzing stress:', error);
        }
    };

    if (!stressData) {
        return null;
    }

    const stressLevel = stressData.stressLevel || 0;
    const isHighStress = stressLevel > 70;
    const isModerateStress = stressLevel > 50 && stressLevel <= 70;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Expanded Details Card */}
            {showDetails && (
                <div className="mb-4 bg-white dark:bg-dominant-800 rounded-xl shadow-xl p-4 w-72 border border-gray-100 dark:border-gray-700 animate-fade-in-up transition-colors">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('stress.stressLevel') || 'Stress Level'}</h3>
                        <button
                            onClick={() => setShowDetails(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">{t('stress.currentLevel') || 'Current Level'}</span>
                            <span className={`font-bold ${isHighStress ? 'text-red-600 dark:text-red-400' :
                                isModerateStress ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-green-600 dark:text-green-400'
                                }`}>
                                {Math.round(stressLevel)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${isHighStress ? 'bg-red-500' :
                                    isModerateStress ? 'bg-yellow-500' :
                                        'bg-green-500'
                                    }`}
                                style={{ width: `${stressLevel}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{t('stress.recommendation') || 'Recommendation'}</p>
                            <p className="text-gray-600 dark:text-gray-300">{stressData.recommendation}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">{t('stress.message') || 'Message'}</p>
                            <p className="text-gray-600 dark:text-gray-300">{stressData.motivationalMessage}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Minimized Floating Button */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${isHighStress ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 ring-2 ring-red-400 dark:ring-red-500' :
                    isModerateStress ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 ring-2 ring-yellow-400 dark:ring-yellow-500' :
                        'bg-white dark:bg-dominant-800 text-green-800 dark:text-green-300 ring-2 ring-green-400 dark:ring-green-500'
                    }`}
            >
                {isHighStress ? (
                    <ExclamationTriangleIcon className={`h-5 w-5 ${isHighStress ? 'animate-pulse' : ''}`} />
                ) : (
                    <CheckCircleIcon className="h-5 w-5" />
                )}
                <span className="font-bold">{Math.round(stressLevel)}%</span>
                {!showDetails && <span className="text-xs font-medium opacity-75 ml-1 hidden sm:inline">{t('stress.stressLevel') || 'Stress Level'}</span>}
            </button>
        </div>
    );
};

export default StressIndicator;
