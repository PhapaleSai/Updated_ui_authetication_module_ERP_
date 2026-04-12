# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Frontend architecture and theme configuration

This project now includes a reusable ERP theme system that can be used by multiple modules.

- `public/erp-theme.css` and `public/erp-theme.js`: shared theme assets.
- `public/colleges/default/config.css`: generic brand overrides.
- `src/theme/themeConfig.js`: runtime theme configuration from environment variables.
- `src/theme/ThemeProvider.jsx`: applies theme variables at startup.
- `src/api/erpApi.js`: centralized API client for backend integration.
- `src/store`: centralized state persisted by `zustand`.

### Environment variables

Copy `.env.example` to `.env` and customize:

- `VITE_API_BASE_URL` — backend address for API calls.
- `VITE_ERP_COLLEGE_NAME` — college title shown in the app.
- `VITE_ERP_MODULE_LABEL` — module label used across the UI.
- `VITE_ERP_LOGO_URL` — logo path for branding.
- `VITE_ERP_PRIMARY_COLOR` — primary theme color.
- `VITE_ERP_ACCENT_COLOR` — accent and active color.
- `VITE_ERP_SIDEBAR_WIDTH` — sidebar width.

## Recommended npm packages

- `axios` — centralized HTTP client for REST API calls.
- `react-router-dom` — routes and nested layouts.
- `zustand` — lightweight global state with persistence.
- `vite` — fast frontend build and dev server.

These packages support a scalable, modular frontend architecture with reusable endpoints, theme config, and global state.
