import React, { useEffect } from 'react';
import themeConfig from './themeConfig';
import { applyTheme } from './themeUtils';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    applyTheme(themeConfig);
  }, []);

  return <>{children}</>;
}
