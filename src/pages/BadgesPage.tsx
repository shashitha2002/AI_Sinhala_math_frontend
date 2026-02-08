import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import BadgesDisplay from '../components/Badges/BadgesDisplay';
import { useTranslation } from '../hooks/useTranslation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const BadgesPage: React.FC = () => {
    const { user } = useAuthContext();
    const { t } = useTranslation();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <Link
                    to="/progress"
                    className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('common.back') || 'Back'}
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {t('progress.badgesEarned') || 'All Badges'}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t('progress.badgesDescription') || 'Explore all available badges and your achievements.'}
                </p>
            </div>

            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-6">
                <BadgesDisplay userId={user?._id} showAll={true} />
            </div>
        </div>
    );
};

export default BadgesPage;
