import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import themeConfig from '../theme/themeConfig';

export default function Sidebar() {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="erp-sidebar">
      <div className="erp-sidebar__brand">
        <img className="erp-sidebar__logo" src={themeConfig.logoUrl} alt="ERP Logo" style={{ objectFit: 'cover' }} />
        <div className="erp-sidebar__brand-text">
          <h2>{themeConfig.collegeName}</h2>
          <span>{themeConfig.moduleLabel}</span>
        </div>
      </div>

      <nav className="erp-sidebar__nav">
        <div className="erp-nav-label">Main Menu</div>
        {currentUser?.role === 'admin' ? (
          <>
            <NavLink to="/admin/dashboard" end className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-chart-line"></i>
              <span className="erp-nav-item__text">Admin Dashboard</span>
            </NavLink>
            <NavLink to="/admin/applications" className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-users"></i>
              <span className="erp-nav-item__text">Applications</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" end className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-gauge-high"></i>
              <span className="erp-nav-item__text">Dashboard</span>
            </NavLink>
            <NavLink to="/brochure" className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-book-open"></i>
              <span className="erp-nav-item__text">Brochure</span>
            </NavLink>
            <NavLink to="/apply" className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-file-signature"></i>
              <span className="erp-nav-item__text">Admission Form</span>
            </NavLink>
            <NavLink to="/documents" className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-file-arrow-up"></i>
              <span className="erp-nav-item__text">Documents</span>
            </NavLink>
            <NavLink to="/status" className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-clock"></i>
              <span className="erp-nav-item__text">Status Tracker</span>
            </NavLink>
            <NavLink to="/payment" className={({ isActive }) => `erp-nav-item ${isActive ? 'erp-nav-item--active' : ''}`}>
              <i className="fa-solid fa-money-bill-wave"></i>
              <span className="erp-nav-item__text">Admission Payment</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="erp-sidebar__footer">
        <div className="erp-avatar erp-avatar--md">{currentUser?.name?.substring(0, 2).toUpperCase() || 'U'}</div>
        <div className="erp-sidebar__user-info">
          <p>{currentUser?.name || 'Applicant'}</p>
          <span>{currentUser?.role === 'admin' ? 'Administrator' : 'Applicant'}</span>
        </div>
        <i className="fa-solid fa-right-from-bracket erp-sidebar__logout" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Logout"></i>
      </div>
    </aside>
  );
}

