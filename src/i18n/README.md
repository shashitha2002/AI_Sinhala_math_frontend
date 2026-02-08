# Internationalization (i18n) Setup

This project supports English (en) and Sinhala (si) languages using `react-i18next`.

## Features

- ✅ English and Sinhala language support
- ✅ Language persistence in localStorage
- ✅ Automatic language detection from browser
- ✅ Easy language switching via hook
- ✅ Custom translation hook with utilities

## Usage

### Basic Usage in Components

```javascript
import { useTranslation } from '../../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.welcomeBack', { name: 'John' })}</p>
    </div>
  );
};
```

### Language Switching

```javascript
import { useTranslation } from '../../hooks/useTranslation';

const MyComponent = () => {
  const { 
    t, 
    changeLanguage, 
    currentLanguage, 
    toggleLanguage,
    isSinhala,
    isEnglish 
  } = useTranslation();

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('si')}>සිංහල</button>
      <button onClick={toggleLanguage}>Toggle Language</button>
      
      <p>Current: {currentLanguage}</p>
      <p>Is Sinhala: {isSinhala}</p>
    </div>
  );
};
```

### Using the LanguageSwitcher Component

```javascript
import LanguageSwitcher from './components/Layout/LanguageSwitcher';

const Navbar = () => {
  return (
    <nav>
      <LanguageSwitcher />
    </nav>
  );
};
```

## Translation Files

- `client/src/i18n/locales/en.json` - English translations
- `client/src/i18n/locales/si.json` - Sinhala translations

## Translation Keys Structure

```
common.*          - Common words (login, logout, save, etc.)
auth.*            - Authentication related
dashboard.*       - Dashboard page
quiz.*            - Quiz functionality
forum.*           - Forum posts and comments
progress.*        - Progress tracking
portfolio.*       - Portfolio/CV generation
stress.*          - Stress detection
errors.*          - Error messages
```

## Adding New Translations

1. Add the key-value pair to both `en.json` and `si.json`
2. Use the key in your component with `t('key.path')`

Example:
```json
// en.json
{
  "mySection": {
    "myKey": "My English Text"
  }
}

// si.json
{
  "mySection": {
    "myKey": "මගේ සිංහල පෙළ"
  }
}
```

## Language Detection

The app automatically detects language from:
1. localStorage (`i18nextLng`)
2. Browser language settings

Default fallback: English (en)

## Installation

The i18n packages are already added to `package.json`:
- `i18next`
- `react-i18next`
- `i18next-browser-languagedetector`

Install dependencies:
```bash
cd client
npm install
```



