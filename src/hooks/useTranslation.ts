import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Custom translation hook with Sinhala and English support
 * Usage: const { t, changeLanguage, currentLanguage } = useTranslation();
 */
export const useTranslation = () => {
    const { t, i18n } = useI18nTranslation();

    const changeLanguage = useCallback((lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('i18nextLng', lang);
    }, [i18n]);

    const currentLanguage = i18n.language || 'en';

    const toggleLanguage = useCallback(() => {
        const newLang = currentLanguage === 'en' ? 'si' : 'en';
        changeLanguage(newLang);
    }, [currentLanguage, changeLanguage]);

    return {
        t,
        changeLanguage,
        currentLanguage,
        toggleLanguage,
        isSinhala: currentLanguage === 'si',
        isEnglish: currentLanguage === 'en'
    };
};

export default useTranslation;
