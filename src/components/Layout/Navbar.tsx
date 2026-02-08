import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    DocumentTextIcon,
    Bars3Icon,
    XMarkIcon,
    SparklesIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import Button from '../UI/Button';

interface NavbarProps {
    user: any;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
    const location = useLocation();
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', labelKey: 'common.dashboard', icon: HomeIcon },
        { path: '/quiz/generate', labelKey: 'common.quiz', icon: AcademicCapIcon },
        { path: '/forum', labelKey: 'common.forum', icon: ChatBubbleLeftRightIcon },
        { path: '/progress', labelKey: 'common.progress', icon: ChartBarIcon },
        { path: '/quiz/history', labelKey: 'common.history', icon: CalendarIcon },
        { path: '/portfolio', labelKey: 'common.portfolio', icon: DocumentTextIcon }
    ];

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav className="bg-white dark:bg-dominant-900 shadow-lg dark:shadow-dominant-800/50 sticky top-0 z-40 border-b border-dominant-200 dark:border-dominant-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <SparklesIcon className="h-6 w-6 sm:h-7 sm:w-7 text-accent-500 dark:text-accent-400" />
                            <Link to="/dashboard" className="text-base sm:text-lg md:text-lg xl:text-xl font-bold bg-gradient-to-r from-dominant-600 to-accent-600 dark:from-dominant-400 dark:to-accent-400 bg-clip-text text-transparent whitespace-nowrap hover:from-dominant-700 hover:to-accent-700 dark:hover:from-dominant-300 dark:hover:to-accent-300 transition-all duration-200">
                                O/L Math AI Platform
                            </Link>
                        </div>
                        <div className="hidden md:ml-2 lg:ml-4 md:flex md:space-x-1 lg:space-x-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                let translatedLabel = t(item.labelKey);
                                if (translatedLabel === item.labelKey) {
                                    const lastPart = item.labelKey.split('.').pop();
                                    if (lastPart) {
                                        translatedLabel = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
                                    }
                                }
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`inline-flex items-center px-2 lg:px-3 py-1.5 border-y-2 border-t-transparent text-sm font-medium transition-all duration-200 whitespace-nowrap gap-2 ${isActive(item.path)
                                            ? 'border-b-accent-500 dark:border-b-accent-400 text-dominant-900 dark:text-dominant-50'
                                            : 'border-b-transparent text-dominant-600 dark:text-dominant-400 hover:border-b-secondary-400 dark:hover:border-b-secondary-500 hover:text-dominant-900 dark:hover:text-dominant-100'
                                            }`}
                                        title={translatedLabel}
                                    >
                                        <Icon className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${isActive(item.path)
                                            ? 'text-accent-500 dark:text-accent-400'
                                            : 'text-dominant-600 dark:text-dominant-400'
                                            }`} aria-hidden="true" />
                                        <span className="hidden xl:inline">{translatedLabel}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="hidden md:flex md:items-center md:gap-2 lg:gap-4">
                        <div className="flex items-center gap-1.5 lg:gap-2">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                        <div className="h-6 w-px bg-dominant-200 dark:bg-dominant-700 mx-1" />
                        <div className="flex items-center gap-2 lg:gap-3">
                            <span className="text-sm text-dominant-700 dark:text-dominant-300 max-w-[100px] lg:max-w-[120px] truncate font-medium">{user.name}</span>
                            <Button variant="danger" size="sm" onClick={onLogout}>
                                {t('common.logout') || 'Logout'}
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center md:hidden gap-3 flex-shrink-0">
                        <ThemeToggle />
                        <LanguageSwitcher />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-md text-dominant-600 dark:text-dominant-400 hover:text-dominant-900 dark:hover:text-dominant-100 hover:bg-dominant-100 dark:hover:bg-dominant-800 focus:outline-none focus:ring-2 focus:ring-dominant-500 transition-all duration-200 touch-manipulation"
                            aria-label={mobileMenuOpen ? (t('common.close') || 'Close') : 'Menu'}
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-dominant-200 dark:border-dominant-800 bg-white dark:bg-dominant-900 transition-colors duration-200 shadow-xl">
                    <div className="px-4 pt-3 pb-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            let translatedLabel = t(item.labelKey);
                            if (translatedLabel === item.labelKey) {
                                const lastPart = item.labelKey.split('.').pop();
                                if (lastPart) {
                                    translatedLabel = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
                                }
                            }
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${isActive(item.path)
                                        ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 border border-accent-100 dark:border-accent-800'
                                        : 'text-dominant-700 dark:text-dominant-300 hover:bg-dominant-100 dark:hover:bg-dominant-800 hover:text-dominant-900 dark:hover:text-dominant-100'
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive(item.path)
                                        ? 'text-accent-600 dark:text-accent-400'
                                        : 'text-dominant-600 dark:text-dominant-400'
                                        }`} aria-hidden="true" />
                                    <span>{translatedLabel}</span>
                                </Link>
                            );
                        })}
                        <div className="pt-4 pb-3 border-t border-dominant-200 dark:border-dominant-800">
                            <div className="flex items-center px-3 mb-3">
                                <span className="text-sm text-dominant-700 dark:text-dominant-300 truncate font-medium">{user.name}</span>
                            </div>
                            <Button variant="danger" size="sm" fullWidth onClick={onLogout}>
                                {t('common.logout') || 'Logout'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
