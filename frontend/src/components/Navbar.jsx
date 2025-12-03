import React from 'react';
import { Navbar as BSNavbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <BSNavbar  variant="dark" className="pb-4 navbarBg">
      <Container fluid>
        <BSNavbar.Brand>{t('app_title')}</BSNavbar.Brand>
        <div className="d-flex align-items-center gap-3">
          <LanguageSwitcher />
          <span className="text-light">
            {user.username} ({user.role})
          </span>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>
            {t('nav.logout')}
          </Button>
        </div>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
