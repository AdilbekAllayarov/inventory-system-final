import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaTachometerAlt,
  FaBoxes,
  FaArrowDown,
  FaArrowUp
} from 'react-icons/fa';

const Sidebar = ({ show, handleClose }) => {
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: <FaTachometerAlt /> },
    { path: '/products', label: t('nav.products'), icon: <FaBoxes /> },
    { path: '/stock-in', label: t('nav.stock_in'), icon: <FaArrowDown /> },
    { path: '/stock-out', label: t('nav.stock_out'), icon: <FaArrowUp /> }
  ];

  const handleNavClick = () => {
    if (show) handleClose();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar d-none d-lg-block p-3">
        <Nav className="flex-column">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas show={show} onHide={handleClose} className="d-lg-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{t('app_title')}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Nav className="flex-column">
            {menuItems.map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                className={`sidebar-mobile-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
