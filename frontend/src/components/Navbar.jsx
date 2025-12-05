import React, { useState } from 'react';
import { Navbar as BSNavbar, Container, Button, Offcanvas } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = ({ onMenuToggle, menuOpen }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [navbarOpen, setNavbarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      <BSNavbar variant="dark" className="pb-2 pb-md-3 navbarBg sticky-top">
        <Container fluid>
          <Button 
            variant="dark" 
            className="d-lg-none me-3" 
            onClick={onMenuToggle}
            size="sm"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </Button>
          <BSNavbar.Brand className="me-auto">{t('app_title')}</BSNavbar.Brand>
          
          {/* Desktop View */}
          <div className="d-none d-md-flex align-items-center gap-2 gap-lg-3">
            <LanguageSwitcher />
            <span className="text-light d-none d-lg-inline" style={{ fontSize: '0.9rem' }}>
              {user.username}
            </span>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              {t('nav.logout')}
            </Button>
          </div>

          {/* Mobile View - Hamburger */}
          <Button 
            variant="dark" 
            className="d-md-none" 
            onClick={() => setNavbarOpen(!navbarOpen)}
            size="sm"
          >
            {navbarOpen ? <FaTimes /> : <FaUser size={20} />}
          </Button>
        </Container>
      </BSNavbar>

      {/* Mobile Navbar Offcanvas */}
      <Offcanvas 
        show={navbarOpen} 
        onHide={() => setNavbarOpen(false)}
        placement="end"
        className="d-md-none"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{user.username}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <div className="d-flex flex-column gap-2 p-3">
            <div className="border-bottom pb-3">
              <LanguageSwitcher />
            </div>
            <Button 
              variant="outline-danger" 
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => {
                setNavbarOpen(false);
                handleLogout();
              }}
            >
              <FaSignOutAlt /> {t('nav.logout')}
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navbar;
