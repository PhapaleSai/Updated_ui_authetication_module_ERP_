import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import 'college-erp-theme/css'
import 'college-erp-theme/colleges/pvg/config.css'
import 'college-erp-theme/js'
import './base.css'

// Apply theme immediately before React renders to prevent black flash
const savedTheme = localStorage.getItem('admin_theme') || 'light';
document.documentElement.setAttribute('data-erp-theme', savedTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>,
)
