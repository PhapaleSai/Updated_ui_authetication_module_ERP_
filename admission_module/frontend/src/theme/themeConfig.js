const themeConfig = {
  collegeName: import.meta.env.VITE_ERP_COLLEGE_NAME || 'PVG’s College of Science & Commerce',
  moduleLabel: import.meta.env.VITE_ERP_MODULE_LABEL || 'Admission & Enrollment',
  logoUrl: import.meta.env.VITE_ERP_LOGO_URL || '/assets/pvg.png',
  primaryColor: import.meta.env.VITE_ERP_PRIMARY_COLOR || '#003A6A',
  accentColor: import.meta.env.VITE_ERP_ACCENT_COLOR || '#ff9800',
  sidebarWidth: import.meta.env.VITE_ERP_SIDEBAR_WIDTH || '270px',
};

export default themeConfig;
