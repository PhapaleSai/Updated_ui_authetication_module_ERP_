export const applyTheme = (config) => {
  const root = document.documentElement;
  const mapped = {
    '--erp-primary': config.primaryColor,
    '--erp-accent': config.accentColor,
    '--erp-sidebar-w': config.sidebarWidth,
  };

  Object.entries(mapped).forEach(([key, value]) => {
    if (value) root.style.setProperty(key, value);
  });

  if (config.logoUrl) {
    root.style.setProperty('--erp-logo-url', `url('${config.logoUrl}')`);
  }
};
