import React from 'react';
import { Navbar as BSNavbar, Container, Button, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars, FaTimes } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ onMenuToggle, menuOpen }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <BSNavbar variant="dark" className="pb-3 pb-md-4 navbarBg sticky-top">
      <Container fluid>
        <Button 
          variant="dark" 
          className="d-lg-none me-3" 
          onClick={onMenuToggle}
          size="sm"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </Button>
        <BSNavbar.Brand>{t('app_title')}</BSNavbar.Brand>
        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-wrap">
          <LanguageSwitcher />
          <span className="text-light d-none d-sm-inline" style={{ fontSize: '0.9rem' }}>
            {user.username}
          </span>
          <span className="text-light d-sm-none" style={{ fontSize: '0.85rem' }}>
            {user.username}
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
