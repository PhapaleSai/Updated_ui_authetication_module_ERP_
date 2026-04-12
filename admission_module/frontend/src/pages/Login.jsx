import React, { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    // Redirect to the central Auth portal
    window.location.href = 'http://localhost:5173/login';
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--erp-surface)' }}>
      <div className="erp-loader"></div>
      <p style={{ marginLeft: '16px', color: 'var(--erp-text)' }}>Redirecting to unified authentication portal...</p>
    </div>
  );
}
