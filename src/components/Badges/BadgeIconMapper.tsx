import React from 'react';
import {
    Trophy,
    Award,
    Medal,
    Star,
    Zap,
    Clock,
    Calendar,
    Flame,
    Gamepad2,
    Calculator,
    Target,
    Crown,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Percent
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Maps badge IDs to specific Lucide icons
 * @param {string} badgeId - The ID of the badge
 * @param {string} className - Optional Tailwind classes
 * @returns {React.ReactNode} - The Lucide icon component
 */
export const getBadgeIcon = (badgeId: string, className: string = "w-8 h-8"): React.ReactNode => {
    // Helper to merge classes
    const getIcon = (Icon: LucideIcon, colorClass: string) => <Icon className={`${className} ${colorClass}`} />;

    const allIcons: Record<string, React.ReactNode> = {
        // Quiz Progress Badges
        'first_quiz': getIcon(Target, "text-blue-500"),
        'quiz_master_10': getIcon(Award, "text-indigo-500"),
        'quiz_master_50': getIcon(Medal, "text-purple-500"),
        'quiz_master_100': getIcon(Trophy, "text-yellow-500"),

        // Performance Badges
        'excellent_score': getIcon(Star, "text-yellow-400"),
        'perfect_score': getIcon(Crown, "text-amber-500"),
        'model_paper_80': getIcon(BookOpen, "text-blue-600"),
        'model_paper_90': getIcon(GraduationCap, "text-purple-600"),
        'topic_master': getIcon(Zap, "text-yellow-500"),

        // Time & Consistency Badges
        'dedicated_learner': getIcon(Clock, "text-cyan-500"),
        'time_champion': getIcon(Calendar, "text-teal-500"),
        'consistent_7': getIcon(Flame, "text-orange-500"),
        'consistent_30': getIcon(TrendingUp, "text-red-500"),

        // Game Badges
        'game_explorer': getIcon(Gamepad2, "text-pink-500"),
        'arcade_fan': getIcon(Calculator, "text-violet-500"),
        'high_scorer': getIcon(Target, "text-red-600"),

        // Average Score Badges
        'avg_score_45': getIcon(Percent, "text-orange-400"),
        'avg_score_55': getIcon(Medal, "text-gray-500"), // Silverish
        'avg_score_65': getIcon(Star, "text-yellow-500"), // Goldish
        'avg_score_75': getIcon(Trophy, "text-indigo-500"),

        // Default fallback
        'default': getIcon(Award, "text-gray-500")
    };

    return allIcons[badgeId] || allIcons['default'];
};

export default getBadgeIcon;
