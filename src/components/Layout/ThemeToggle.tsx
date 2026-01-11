import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg transition-all duration-200 
                 bg-dominant-100 dark:bg-dominant-800 
                 text-dominant-700 dark:text-dominant-200 
                 hover:bg-dominant-200 dark:hover:bg-dominant-700
                 focus:outline-none focus:ring-2 focus:ring-dominant-500 focus:ring-offset-2
                 touch-manipulation flex items-center justify-center"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <SunIcon
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
                        }`}
                />
                <MoonIcon
                    className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                        }`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
