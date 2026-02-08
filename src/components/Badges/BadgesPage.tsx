import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import BadgesDisplay from './BadgesDisplay';

interface User {
    _id: string;
    [key: string]: any;
}

interface BadgesPageProps {
    user: User | null;
}

const BadgesPage: React.FC<BadgesPageProps> = ({ user }) => {
    const { t } = useTranslation();

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('badges.title') || 'Your Badges'}</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {t('badges.description') || 'View all your earned badges and achievements'}
                </p>
            </div>

            <BadgesDisplay userId={user._id} showAll={true} />
        </div>
    );
};

export default BadgesPage;
