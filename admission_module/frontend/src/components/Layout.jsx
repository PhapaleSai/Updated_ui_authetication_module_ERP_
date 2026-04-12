import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useAuthStore from '../store/useAuthStore';

export default function Layout() {
  const location = useLocation();
  const { currentUser } = useAuthStore();

  // Re-run theme's page setup (like breadcrumbs) on route change if needed
  useEffect(() => {
    // A small hack to trigger the theme's breadcrumb generation
    // since React modifies the DOM without full page loads.
    if (window.ERP && window.ERP.refreshLayout) {
       window.ERP.refreshLayout();
    }
  }, [location.pathname]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Sidebar />
      <Topbar />
      {/* Route Outlet */}
      <Outlet />
    </>
  );
}
