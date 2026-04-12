import React from 'react';

export default function Topbar() {
  return (
    <header className="erp-topbar">
      <button className="erp-topbar__btn" data-erp-sidebar-toggle="true" onClick={(e) => { e.preventDefault(); window.ERP?.Sidebar?.toggle(); }}>
        <i className="fa-solid fa-bars"></i>
      </button>
      
      <nav className="erp-topbar__breadcrumb" data-erp-breadcrumb="true">
        {/* Dynamic breadcrumbs built by erp-theme.js based on main layout data-erp-page */}
      </nav>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="erp-topbar__btn" data-erp-notif-toggle="true" onClick={(e) => {
          e.stopPropagation();
          const panel = document.querySelector('.erp-notif-panel');
          if (panel) panel.classList.toggle('erp-notif--open');
        }}>
          <i className="fa-regular fa-bell"></i>
          <span className="erp-badge erp-badge--danger" style={{ position: 'absolute', top: 8, right: 8, transform: 'scale(0.7)' }}>2</span>
        </button>
      </div>
    </header>
  );
}
