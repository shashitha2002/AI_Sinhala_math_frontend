import React, { useState, useEffect } from 'react';
import { badgeService } from '../../services/badgeService';
import { getBadgeIcon } from './BadgeIconMapper';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

interface Badge {
    badgeId: string;
    name: string;
    description: string;
    earned: boolean;
    earnedDate?: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface BadgeResponseData {
    success: boolean;
    allBadges: Badge[];
    earnedBadges: Badge[];
    newlyAwarded?: Badge[];
    totalEarned: number;
    totalAvailable: number;
    progress: number;
}

interface BadgesDisplayProps {
    userId?: string;
    showAll?: boolean;
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ userId, showAll = false }) => {
    const { t } = useTranslation();
    const [badges, setBadges] = useState<BadgeResponseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [newlyAwarded, setNewlyAwarded] = useState<Badge[]>([]);

    useEffect(() => {
        if (userId) {
            fetchBadges();
        }
    }, [userId]);

    const fetchBadges = async () => {
        try {
            const response = await badgeService.getMyBadges();
            if (response.data && response.data.success) {
                setBadges(response.data);

                // Show notification for newly awarded badges
                if (response.data.newlyAwarded && response.data.newlyAwarded.length > 0) {
                    setNewlyAwarded(response.data.newlyAwarded);
                    setTimeout(() => setNewlyAwarded([]), 5000); // Hide after 5 seconds
                }
            }
        } catch (error) {
            console.error('Error fetching badges:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="text-gray-500 dark:text-gray-400">{t('common.loading') || 'Loading...'}</div>
            </div>
        );
    }

    if (!badges) {
        return null;
    }

    const badgesToShow = showAll ? (badges.allBadges || []) : (badges.earnedBadges || []);

    return (
        <div className="w-full">
            {/* New Badge Notification */}
            {newlyAwarded?.length > 0 && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                        {getBadgeIcon(newlyAwarded[0]?.badgeId, "h-6 w-6 text-green-600 dark:text-green-400 mr-2")}
                        <div>
                            <h4 className="font-semibold text-green-900 dark:text-green-300">New Badge Earned!</h4>
                            {newlyAwarded.map((badge, idx) => (
                                <p key={idx} className="text-sm text-green-700 dark:text-green-400">
                                    <span className="mr-2 inline-block align-middle">
                                        {getBadgeIcon(badge.badgeId, "w-4 h-4")}
                                    </span>
                                    {badge.name} - {badge.description}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Badge Stats */}
            {showAll && (
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-dominant-800 rounded-lg shadow p-4 transition-colors">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{badges.totalEarned}</p>
                    </div>
                    <div className="bg-white dark:bg-dominant-800 rounded-lg shadow p-4 transition-colors">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Available</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{badges.totalAvailable}</p>
                    </div>
                    <div className="bg-white dark:bg-dominant-800 rounded-lg shadow p-4 transition-colors">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{badges.progress}%</p>
                    </div>
                </div>
            )}

            {/* Badges Grid */}
            {badgesToShow.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {badgesToShow.map((badge, idx) => (
                        <div
                            key={idx}
                            className={`relative rounded-2xl p-6 text-center transition-all duration-300 transform hover:scale-105 ${badge.earned
                                ? 'bg-gradient-to-br from-white to-gray-50 dark:from-dominant-800 dark:to-dominant-900 border-2 shadow-lg hover:shadow-xl'
                                : 'bg-gray-100/50 dark:bg-gray-800/30 border-2 border-dashed border-gray-300 dark:border-gray-700 opacity-50'
                                } ${badge.earned && badge.rarity === 'legendary' ? 'border-yellow-400 dark:border-yellow-500' :
                                    badge.earned && badge.rarity === 'epic' ? 'border-purple-400 dark:border-purple-500' :
                                        badge.earned && badge.rarity === 'rare' ? 'border-blue-400 dark:border-blue-500' :
                                            badge.earned && badge.rarity === 'uncommon' ? 'border-green-400 dark:border-green-500' :
                                                badge.earned ? 'border-gray-300 dark:border-gray-600' : ''
                                }`}
                        >
                            {/* Rarity Badge */}
                            {badge.earned && (
                                <div className="absolute -top-2 -right-2 z-10">
                                    <div className={`rounded-full p-2 shadow-lg ${badge.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                        badge.rarity === 'epic' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                                            badge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                                                badge.rarity === 'uncommon' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                                    'bg-gradient-to-br from-gray-400 to-gray-600'
                                        }`}>
                                        <TrophyIcon className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`flex justify-center mb-4 ${!badge.earned ? 'grayscale opacity-40' : ''}`}>
                                <div className={`p-4 rounded-full ${badge.earned && badge.rarity === 'legendary' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                    badge.earned && badge.rarity === 'epic' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                        badge.earned && badge.rarity === 'rare' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                            badge.earned && badge.rarity === 'uncommon' ? 'bg-green-100 dark:bg-green-900/30' :
                                                badge.earned ? 'bg-gray-100 dark:bg-gray-800' :
                                                    'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                    {getBadgeIcon(badge.badgeId, `w-10 h-10 ${badge.earned && badge.rarity === 'legendary' ? 'text-yellow-600 dark:text-yellow-400' :
                                        badge.earned && badge.rarity === 'epic' ? 'text-purple-600 dark:text-purple-400' :
                                            badge.earned && badge.rarity === 'rare' ? 'text-blue-600 dark:text-blue-400' :
                                                badge.earned && badge.rarity === 'uncommon' ? 'text-green-600 dark:text-green-400' :
                                                    badge.earned ? 'text-gray-600 dark:text-gray-400' :
                                                        'text-gray-400 dark:text-gray-600'
                                        }`)}
                                </div>
                            </div>

                            {/* Badge Name */}
                            <h4 className={`font-bold text-sm mb-2 ${badge.earned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'
                                }`}>
                                {t(`badges.${badge.badgeId}.name`) || badge.name}
                            </h4>

                            {/* Description */}
                            <p className={`text-xs mb-3 line-clamp-2 min-h-[2.5rem] ${badge.earned ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'
                                }`}>
                                {t(`badges.${badge.badgeId}.description`) || badge.description}
                            </p>

                            {/* Rarity Tag */}
                            <div className="flex justify-center">
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${badge.earned && badge.rarity === 'legendary' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                    badge.earned && badge.rarity === 'epic' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                        badge.earned && badge.rarity === 'rare' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                            badge.earned && badge.rarity === 'uncommon' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                badge.earned ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                                                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-500'
                                    } capitalize`}>
                                    {badge.rarity}
                                </span>
                            </div>

                            {/* Earned Date */}
                            {badge.earned && badge.earnedDate && (
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-3">
                                    {new Date(badge.earnedDate).toLocaleDateString()}
                                </p>
                            )}

                            {/* Locked Overlay for Unearned */}
                            {!badge.earned && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/5 dark:bg-black/20">
                                    <div className="text-gray-400 dark:text-gray-600">
                                        <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                        <TrophyIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-lg font-medium mb-2">{showAll ? (t('progress.noBadges') || 'No badges available') : (t('progress.noBadges') || 'No badges earned yet')}</p>
                    <p className="text-sm">{t('progress.trackJourney') || 'Start your journey to earn badges!'}</p>
                </div>
            )}
        </div>
    );
};

export default BadgesDisplay;
