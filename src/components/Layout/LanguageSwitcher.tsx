import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher: React.FC = () => {
    const { currentLanguage, changeLanguage, isSinhala } = useTranslation();

    return (
        <div className="relative">
            <button
                onClick={() => changeLanguage(currentLanguage === 'en' ? 'si' : 'en')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                   text-gray-700 dark:text-gray-200 
                   hover:text-primary-600 dark:hover:text-primary-400 
                   hover:bg-gray-50 dark:hover:bg-dominant-800 
                   rounded-md transition-colors"
                title={isSinhala ? "Switch to English" : "සිංහලට මාරු වන්න"}
            >
                <GlobeAltIcon className="h-5 w-5" />
                <span className="hidden sm:inline">
                    {currentLanguage === 'en' ? 'English' : 'සිංහල'}
                </span>
                <span className="sm:hidden">
                    {currentLanguage === 'en' ? 'EN' : 'SI'}
                </span>
            </button>
        </div>
    );
};

export default LanguageSwitcher;
