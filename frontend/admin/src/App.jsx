import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import api from './api';
import { AuthContext, useAuth } from './AuthContext';

// Pages
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Audit from './pages/Audit';
import UserProfile from './pages/UserProfile';
import Export from './pages/Export';
import Welcome from './pages/student/Welcome';

// AuthContext is imported from ./AuthContext.js

function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
            return;
        }
        // Refresh user data from API in background
        api.get('/users/me')
            .then(res => {
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            })
            .catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        api.post('/auth/logout').finally(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login';
        });
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--erp-bg)' }}>
            <div className="erp-loader"></div>
        </div>
    );

    if (!localStorage.getItem('token') || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase())) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// ── Sidebar Nav Link ─────────────────────────────────────────────────────────
function SidebarLink({ to, icon, label, badge }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link 
            to={to} 
            className={`erp-nav-item ${isActive ? 'active' : ''}`}
        >
            <i className={`fa-solid ${icon}`}></i>
            <span className="erp-nav-item__text">{label}</span>
            {badge && <span className="erp-badge">{badge}</span>}
        </Link>
    );
}

// ── Sidebar Layout ────────────────────────────────────────────────────────────
function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-erp-theme', theme);
        localStorage.setItem('admin_theme', theme);
    }, [theme]);

    if (!user) return null;

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/users') return 'User Management';
        if (path.startsWith('/users/')) return 'User Profile';
        if (path === '/roles') return 'Roles & RBAC';
        if (path === '/audit') return 'Audit Log';
        if (path === '/export') return 'Export Hub';
        return 'Portal';
    };

    const isAdminRole = ['admin', 'vice_principal', 'hod'].includes(user.role?.toLowerCase());
    const isSuperAdmin = ['admin', 'vice_principal'].includes(user.role?.toLowerCase());

    return (
        <div className="erp-layout">
            <aside className="erp-sidebar">
                {/* No decorative shapes — clean sidebar */}

                <div className="erp-sidebar__brand">
                    <img src="/assets/pvg_logo.png" alt="PVG Logo" className="erp-sidebar__logo" />
                    <div className="erp-sidebar__brand-text">
                        <h2>PVG College of Science</h2>
                        <span>Campus Portal</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="erp-sidebar__nav">
                    {/* General */}
                    <div className="erp-nav-label">General</div>
                    <SidebarLink to="/dashboard" icon="fa-gauge-high" label="Dashboard" />

                    {isAdminRole && (
                        <>
                            <div className="erp-nav-label">Administration</div>
                            {isSuperAdmin && (
                                <>
                                    <SidebarLink to="/users" icon="fa-users" label="User Management" />
                                    <SidebarLink to="/roles" icon="fa-shield-halved" label="Roles & RBAC" />
                                </>
                            )}
                            <div className="erp-nav-label">System</div>
                            <SidebarLink to="/audit" icon="fa-clipboard-list" label="Audit Log" />
                            <SidebarLink to="/export" icon="fa-file-export" label="Export Hub" />

                            <div className="erp-nav-label">Integrations</div>
                            <div
                                onClick={() => {
                                    const adminRoles = ['admin', 'it admins', 'principal', 'principals & vice principals', 'hod'];
                                    const targetRole = adminRoles.includes(user?.role?.toLowerCase()) ? 'admin' : (user?.role || 'student');
                                    window.location.href = `${import.meta.env.VITE_ADMISSION_URL}/callback?user_id=${user?.user_id || ''}&name=${encodeURIComponent(user?.full_name || '')}&role=${targetRole}`;
                                }}
                                style={{ textDecoration: 'none' }}
                            >
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.6rem 0.75rem', borderRadius: '12px', marginBottom: '2px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}
                                >
                                    <div style={{
                                        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <i className="fa-solid fa-graduation-cap" style={{ fontSize: '0.8rem', color: '#fbbf24' }}></i>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>
                                        Admission Module
                                    </span>
                                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}></i>
                                </div>
                            </div>
                        </>
                    )}
                </nav>

                {/* User Footer */}
                <div className="erp-sidebar__footer">
                    <div className="erp-avatar">{user.username?.[0]?.toUpperCase()}</div>
                    <div className="erp-sidebar__user-info">
                        <p>{user.username}</p>
                        <span>{user.role}</span>
                    </div>
                    <div className="erp-sidebar__logout" onClick={logout} title="Logout">
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </div>
                </div>
            </aside>

            <div className="erp-content">
                <header className="erp-topbar" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="erp-topbar__btn" onClick={() => {
                            document.querySelector('.erp-sidebar').classList.toggle('erp-sidebar--collapsed');
                        }}>
                            <i className="fa-solid fa-bars"></i>
                        </button>
                        <nav className="erp-topbar__breadcrumb">
                            <Link to="/dashboard">Portal</Link>
                            <i className="fa-solid fa-chevron-right"></i>
                            <span className="current">{getPageTitle()}</span>
                        </nav>
                    </div>

                    <div className="erp-topbar__actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* ── Module Quick-Launch Buttons (Admin only) ── */}
                        {['admin', 'it admins', 'principal', 'principals & vice principals', 'hod', 'vice_principal'].includes(user?.role?.toLowerCase()) && (() => {
                            const getModuleURL = (type) => {
                                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                                if (isLocal) {
                                    if (type === 'ADMISSION') return 'http://localhost:3000';
                                    if (type === 'SIS') return 'http://localhost:5174';
                                    if (type === 'FEES') return 'http://localhost:5176';
                                }
                                if (type === 'ADMISSION') return import.meta.env.VITE_ADMISSION_URL;
                                if (type === 'SIS') return import.meta.env.VITE_SIS_URL;
                                if (type === 'FEES') return import.meta.env.VITE_FEES_URL;
                                return '';
                            };
                            const uid = user?.user_id || '';
                            const name = encodeURIComponent(user?.full_name || user?.username || '');
                            const isAdmin = ['admin', 'it admins', 'principal', 'principals & vice principals', 'hod'].includes(user?.role?.toLowerCase());
                            const roleParam = isAdmin ? 'admin' : (user?.role || 'staff');
                            const modules = [
                                { key: 'ADMISSION', label: 'Admission', icon: 'fa-graduation-cap', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: '#f59e0b', href: `${getModuleURL('ADMISSION')}/callback?user_id=${uid}&name=${name}&role=${roleParam}` },
                                { key: 'SIS', label: 'SIS', icon: 'fa-book-open', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: '#3b82f6', href: `${getModuleURL('SIS')}/callback?user_id=${uid}&role=${roleParam}` },
                                { key: 'FEES', label: 'Fees', icon: 'fa-indian-rupee-sign', gradient: 'linear-gradient(135deg, #10b981, #059669)', shadow: '#10b981', href: `${getModuleURL('FEES')}/admin?token=${localStorage.getItem('token')}&user_id=${uid}&role=admin&name=${name}` },
                            ];
                            return modules.map(m => (
                                <a
                                    key={m.key}
                                    href={m.href}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem 1.1rem', borderRadius: '22px',
                                        background: m.gradient,
                                        color: '#fff', fontSize: '0.8rem', fontWeight: 700,
                                        textDecoration: 'none',
                                        boxShadow: `0 4px 16px ${m.shadow}50`,
                                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                                        letterSpacing: '0.025em',
                                        whiteSpace: 'nowrap',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                        e.currentTarget.style.boxShadow = `0 8px 24px ${m.shadow}70`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = `0 4px 16px ${m.shadow}50`;
                                    }}
                                >
                                    <span style={{
                                        width: '20px', height: '20px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.25)',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <i className={`fa-solid ${m.icon}`} style={{ fontSize: '0.65rem' }}></i>
                                    </span>
                                    {m.label}
                                </a>
                            ));
                        })()}

                        <div style={{ height: '24px', width: '1px', background: 'var(--erp-border)' }}></div>
                        <button
                            className="erp-btn erp-btn--ghost erp-btn--sm"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        <div style={{ height: '24px', width: '1px', background: 'var(--erp-border)' }}></div>
                        <div className="erp-topbar__user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate(`/users/${user.user_id}`)}>
                            <div className="erp-avatar erp-avatar--sm" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>{user.username?.[0]?.toUpperCase()}</div>
                            <span className="erp-topbar__user-name" style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.username}</span>
                        </div>
                    </div>
                </header>

                <main className="erp-main">
                    <div className="erp-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// ── Smart Root Redirect ───────────────────────────────────────────────────────
// Restores session persistence: if a token exists, go straight to dashboard.
// This runs at '/' and '*' so reopening the browser auto-logs the user in.
function SmartRedirect() {
    const token = localStorage.getItem('token');
    return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

// ── App Routes ────────────────────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/welcome" element={
                <ProtectedRoute>
                    <Welcome />
                </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><Users /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/users/:id" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><UserProfile /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/roles" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal']}>
                    <Layout><Roles /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/audit" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal', 'hod']}>
                    <Layout><Audit /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/export" element={
                <ProtectedRoute allowedRoles={['admin', 'vice_principal', 'hod']}>
                    <Layout><Export /></Layout>
                </ProtectedRoute>
            } />

            {/* Smart root: token present → dashboard, else → login */}
            <Route path="/" element={<SmartRedirect />} />
            <Route path="*" element={<SmartRedirect />} />
        </Routes>
    );
}

// ── Root Component ────────────────────────────────────────────────────────────
// Pages like Dashboard need the user — they'll use the useAuth() hook
export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
