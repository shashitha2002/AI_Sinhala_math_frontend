import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { gameService } from '../../services/gameService';
import { badgeService } from '../../services/badgeService';
import { CalendarIcon, FireIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { TrophyIcon } from '@heroicons/react/24/outline';

interface ActivityCalendarProps {
    userId?: string;
}

interface ActivityLogItem {
    date: string;
    quizzes: number;
    games: number;
    posts: number;
}

interface ActivityDisplayItem {
    date: Date;
    isCurrentMonth: boolean;
    activity: {
        hasActivity: boolean;
        quizzes: number;
        games: number;
        posts: number;
    };
    badges: any[];
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ userId }) => {
    const { t } = useTranslation();
    const [activityData, setActivityData] = useState<any[]>([]);
    const [badges, setBadges] = useState<any[]>([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [activityRes, badgesRes] = await Promise.all([
                gameService.getActivityLog(),
                badgeService.getMyBadges()
            ]);

            if (activityRes.data && activityRes.data.success) {
                const rawLog: ActivityLogItem[] = activityRes.data.activityLog || [];
                const activities = rawLog.map(item => ({
                    date: new Date(item.date),
                    hasActivity: (item.quizzes || 0) > 0 || (item.games || 0) > 0 || (item.posts || 0) > 0,
                    quizzes: item.quizzes || 0,
                    games: item.games || 0,
                    posts: item.posts || 0
                }));
                setActivityData(activities);
                calculateStreak(activities);
            }

            if (badgesRes.data && badgesRes.data.success) {
                setBadges(badgesRes.data.earnedBadges || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStreak = (activities: any[]) => {
        const sortedActivities = activities
            .filter(a => a.hasActivity)
            .sort((a, b) => b.date.getTime() - a.date.getTime());

        if (sortedActivities.length === 0) {
            setCurrentStreak(0);
            return;
        }

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);

        // Check if today is active
        const todayActivity = sortedActivities.find(a => {
            const activityDate = new Date(a.date);
            activityDate.setHours(0, 0, 0, 0);
            return activityDate.getTime() === checkDate.getTime();
        });

        if (!todayActivity) {
            // If not active today, start from yesterday
            checkDate.setDate(checkDate.getDate() - 1);
        }

        for (const activity of sortedActivities) {
            const activityDate = new Date(activity.date);
            activityDate.setHours(0, 0, 0, 0);

            if (activityDate.getTime() === checkDate.getTime()) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (activityDate.getTime() < checkDate.getTime()) {
                break;
            }
        }

        setCurrentStreak(streak);
    };

    const getIntensity = (activity: any) => {
        if (!activity?.hasActivity) return 0;
        const totalActivity = (activity.quizzes || 0) + (activity.games || 0) + (activity.posts || 0);
        if (totalActivity >= 5) return 4;
        if (totalActivity >= 3) return 3;
        if (totalActivity >= 2) return 2;
        return 1;
    };

    const getIntensityColor = (intensity: number) => {
        switch (intensity) {
            case 4: return 'bg-green-600';
            case 3: return 'bg-green-500';
            case 2: return 'bg-green-400';
            case 1: return 'bg-green-300';
            default: return 'bg-gray-100 dark:bg-gray-700';
        }
    };

    // Generate calendar grid for the current month
    const generateMonthDays = (): ActivityDisplayItem[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Start date should be the Sunday before the first day of the month
        const startDate = new Date(firstDay);
        startDate.setDate(1 - startDate.getDay());

        // End date should be the Saturday after the last day of the month to complete the row
        const endDate = new Date(lastDay);
        if (endDate.getDay() !== 6) {
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        }

        const days: ActivityDisplayItem[] = [];
        let day = new Date(startDate);

        while (day <= endDate) {
            const currentDayDate = new Date(day);
            currentDayDate.setHours(0, 0, 0, 0);

            // Find activity
            const activity = activityData.find(a => {
                const activityDate = new Date(a.date);
                activityDate.setHours(0, 0, 0, 0);
                return activityDate.getTime() === currentDayDate.getTime();
            });

            // Find badges earned on this date
            const earnedBadges = badges.filter(badge => {
                if (!badge.earnedDate) return false;
                const badgeDate = new Date(badge.earnedDate);
                badgeDate.setHours(0, 0, 0, 0);
                return badgeDate.getTime() === currentDayDate.getTime();
            });

            days.push({
                date: currentDayDate,
                isCurrentMonth: currentDayDate.getMonth() === month,
                activity: activity || { hasActivity: false, quizzes: 0, games: 0, posts: 0 },
                badges: earnedBadges
            });

            day.setDate(day.getDate() + 1);
        }

        return days;
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const monthDays = generateMonthDays();

    const monthNames = [
        t('months.january', 'January'), t('months.february', 'February'), t('months.march', 'March'),
        t('months.april', 'April'), t('months.may', 'May'), t('months.june', 'June'),
        t('months.july', 'July'), t('months.august', 'August'), t('months.september', 'September'),
        t('months.october', 'October'), t('months.november', 'November'), t('months.december', 'December')
    ];

    if (loading && activityData.length === 0) {
        return (
            <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors">
                <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('common.loading') || 'Loading...'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-dominant-800 rounded-xl shadow-lg p-4 sm:p-6 transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t('games.activityCalendar') || 'Activity Calendar'}</h2>
                </div>

                <div className="flex items-center gap-4">
                    {currentStreak > 0 && (
                        <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                            <FireIcon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-orange-800 dark:text-orange-200 font-semibold whitespace-nowrap">
                                {currentStreak} {t('games.streak') || 'Day Streak'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dominant-700 text-gray-600 dark:text-gray-400"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dominant-700 text-gray-600 dark:text-gray-400"
                    disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                >
                    <ChevronRightIcon className={`h-5 w-5 ${currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`} />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-3 sm:mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-1 sm:py-2">
                        {day.substring(0, 1)}
                    </div>
                ))}
                {monthDays.map((day, index) => {
                    const intensity = getIntensity(day.activity);
                    const color = getIntensityColor(intensity);
                    const isToday = day.date.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={index}
                            className={`aspect-square rounded-sm ${color} relative group
                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                ${isToday ? 'ring-2 ring-primary-500' : ''}
                flex items-center justify-center text-xs font-semibold
                cursor-pointer hover:scale-110 transition-transform
              `}
                            title={`${day.date.toLocaleDateString()}: ${day.activity.quizzes} ${t('games.quizzes') || 'Quizzes'}, ${day.activity.games} ${t('games.games') || 'Games'}`}
                        >
                            <span className={`${intensity > 1 ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                {day.date.getDate()}
                            </span>

                            {/* Badge Indicator */}
                            {day.badges.length > 0 && (
                                <div className="absolute top-0 right-0 p-0.5">
                                    {/* Show the icon of the first badge earned that day, or a generic trophy if complex */}
                                    {day.badges[0].icon ? (
                                        <span className="text-[10px] leading-none filter drop-shadow-sm" title={day.badges.map((b: any) => b.name).join(', ')}>
                                            {day.badges[0].icon}
                                        </span>
                                    ) : (
                                        <TrophyIcon className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Start/Legend Summary */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-dominant-700">
                <span className="hidden sm:inline">{t('games.less') || 'Less'}</span>
                <div className="flex gap-0.5 sm:gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-300"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-400"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-500"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-green-600"></div>
                </div>
                <span className="hidden sm:inline">{t('games.more') || 'More'}</span>
            </div>

            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('games.totalActivities') || 'Total Activities'}: {activityData.reduce((sum, a) => sum + (a.quizzes || 0) + (a.games || 0) + (a.posts || 0), 0)}
                </p>
            </div>

        </div>
    );
};

export default ActivityCalendar;
