import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ja', label: '日本語' },
    { code: 'uz', label: 'UZ' }
  ];

  return (
    <div className="language-switcher">
      <ButtonGroup size="sm">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={i18n.language === lang.code ? 'primary' : 'outline-primary'}
            onClick={() => changeLanguage(lang.code)}
            className="language-btn"
          >
            {lang.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default LanguageSwitcher;
