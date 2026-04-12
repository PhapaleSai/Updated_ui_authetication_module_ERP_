import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AdmissionForm from './pages/AdmissionForm';
import Brochure from './pages/Brochure';
import DocumentUpload from './pages/DocumentUpload';
import ApplicationPreview from './pages/ApplicationPreview';
import ApplicationStatus from './pages/ApplicationStatus';
import FinalPayment from './pages/FinalPayment';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationsList from './pages/admin/ApplicationsList';
import ApplicationReview from './pages/admin/ApplicationReview';

const ProtectedRoute = ({ children }) => {
  const { checkAuth, currentUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Cross-Domain SSO: Intercept token passed from Auth Frontend
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token');
    
    if (urlToken) {
      localStorage.setItem('token', urlToken);
      // Clean the URL without causing a full page refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    checkAuth();
    setIsChecking(false);
  }, [checkAuth]);

  if (isChecking) {
    return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}><div className="erp-loader"></div></div>;
  }

  if (!currentUser) {
    window.location.href = 'http://localhost:5173/login';
    return null; // Don't render until redirected
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="brochure" element={<Brochure />} />
        <Route path="apply" element={<AdmissionForm />} />
        <Route path="documents" element={<DocumentUpload />} />
        <Route path="preview" element={<ApplicationPreview />} />
        <Route path="status" element={<ApplicationStatus />} />
        <Route path="payment" element={<FinalPayment />} />
        
        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/applications" element={<ApplicationsList />} />
        <Route path="admin/applications/:id" element={<ApplicationReview />} />
      </Route>
    </Routes>
  );
}

export default App;
