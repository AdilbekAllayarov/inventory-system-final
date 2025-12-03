import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaTachometerAlt,
  FaBoxes,
  FaArrowDown,
  FaArrowUp
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: <FaTachometerAlt /> },
    { path: '/products', label: t('nav.products'), icon: <FaBoxes /> },
    { path: '/stock-in', label: t('nav.stock_in'), icon: <FaArrowDown /> },
    { path: '/stock-out', label: t('nav.stock_out'), icon: <FaArrowUp /> }
  ];

  return (
    <div className="sidebar p-3">
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
  );
};

export default Sidebar;
