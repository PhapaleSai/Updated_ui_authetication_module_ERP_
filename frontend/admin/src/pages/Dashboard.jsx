import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import api from '../api';

const Dashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [audit, setAudit] = useState([]);
    const [traffic, setTraffic] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartMode, setChartMode] = useState('live'); // 'live' or '24h'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'student' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    // Live mock data
    const liveData = [
        { time: '12:00', value: 400 },
        { time: '13:00', value: 300 },
        { time: '14:00', value: 900 },
        { time: '15:00', value: 1200 },
        { time: '16:00', value: 1500 },
        { time: '17:00', value: 800 },
        { time: '18:00', value: 600 },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (chartMode === '24h') {
            fetchTraffic();
        } else {
            setTraffic(liveData);
        }
    }, [chartMode]);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/audit')
        ]).then(([sRes, aRes]) => {
            setStats(sRes.data);
            setAudit(aRes.data.slice(0, 5));
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    };

    const fetchTraffic = async () => {
        try {
            const res = await api.get('/admin/traffic');
            setTraffic(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/auth/register', newUser);
            setMessage({ type: 'success', text: 'User created successfully!' });
            setNewUser({ username: '', email: '', password: '', role: 'student' });
            setTimeout(() => {
                setIsModalOpen(false);
                setMessage({ type: '', text: '' });
                fetchData();
            }, 1000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create user.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !stats) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="avatar" style={{ animation: 'pulse 2s infinite', width: 80, height: 80, fontSize: '2rem' }}>PVG</div>
        </div>
    );

    const cards = [
        { label: 'Total Users', value: stats?.total_users || 0, icon: '👥', color: 'var(--accent-primary)', path: '/users' },
        { label: 'Active Sessions', value: stats?.active_sessions || 0, icon: '⚡', color: 'var(--accent-secondary)', path: '/audit' },
        { label: 'System Roles', value: stats?.total_roles || 0, icon: '🛡️', color: 'var(--warning)', path: '/roles' },
    ];

    const quickActions = [
        { label: 'Add User', desc: 'Onboard new staff/student', icon: '➕', action: () => setIsModalOpen(true), color: 'var(--accent-primary)' },
        { label: 'Manage Roles', desc: 'Configure RBAC policies', icon: '🛡️', path: '/roles', color: 'var(--warning)' },
        { label: 'Audit Desk', desc: 'Review system telemetry', icon: '🔍', path: '/audit', color: 'var(--accent-secondary)' },
        { label: 'Export Data', desc: 'Snapshot system state', icon: '💾', path: '/export', color: 'var(--accent-tertiary)' },
    ];

    return (
        <div className="dashboard-view">
            {/* Dynamic Greeting */}
            <header className="greeting-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div className="badge badge-admin shimmer-effect" style={{ marginBottom: '1rem' }}>
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <h1 className="greeting-text">{getGreeting()}, {user?.username}!</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Here is what's happening in the system today.
                        </p>
                    </div>
                </div>
            </header>

            {/* Security Alert */}
            {stats?.active_sessions > 10 && (
                <div className="alert-banner">
                    <div className="alert-content">
                        <div className="alert-pulse"></div>
                        <div>
                            <strong style={{ color: 'var(--error)' }}>High Activity Detected:</strong> Currently {stats.active_sessions} concurrent sessions active.
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => navigate('/audit')}>
                        Investigate
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                {cards.map((card, i) => (
                    <div 
                        key={i} 
                        className="stat-card" 
                        style={{ animationDelay: `${i * 0.1}s` }}
                        onClick={() => navigate(card.path)}
                    >
                        <div className="stat-icon-wrapper" style={{ border: `1px solid ${card.color}44`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div>
                            <div className="stat-label">{card.label}</div>
                            <div className="stat-value">{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Visual Analytics */}
            <div className="chart-section">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">System Traffic Analysis</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span 
                                className={`badge ${chartMode === 'live' ? 'badge-faculty' : ''}`} 
                                onClick={() => setChartMode('live')}
                                style={{ cursor: 'pointer', opacity: chartMode === 'live' ? 1 : 0.5 }}
                            >
                                Real-time
                            </span>
                            <span 
                                className={`badge ${chartMode === '24h' ? 'badge-guest' : ''}`} 
                                onClick={() => setChartMode('24h')}
                                style={{ cursor: 'pointer', opacity: chartMode === '24h' ? 1 : 0.5 }}
                            >
                                Last 24h
                            </span>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={traffic.length > 0 ? traffic : liveData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="quick-actions-container">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Management Shortcuts</h3>
                <div className="quick-actions-grid">
                    {quickActions.map((action, i) => (
                        <div key={i} className="action-card" onClick={action.action ? action.action : () => navigate(action.path)}>
                            <div className="action-icon" style={{ color: action.color, background: `${action.color}15` }}>
                                {action.icon}
                            </div>
                            <div>
                                <div className="action-label">{action.label}</div>
                                <div className="action-desc">{action.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activities & Health Feed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem', marginTop: '3rem' }}>
                <div className="card" onClick={() => navigate('/audit')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Recent System Activities</h3>
                        <div className="badge badge-admin shimmer-effect">Live Telemetry</div>
                    </div>
                    <div className="table-wrapper">
                        <table style={{ borderSpacing: '0 8px', borderCollapse: 'separate' }}>
                            <thead>
                                <tr style={{ borderBottom: 'none' }}>
                                    <th style={{ padding: '0 1rem' }}>Subject</th>
                                    <th style={{ padding: '0 1rem' }}>Action</th>
                                    <th style={{ padding: '0 1rem' }}>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {audit.map((log, i) => (
                                    <tr key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                                        <td style={{ padding: '1rem', border: 'none', borderRadius: '12px 0 0 12px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{log.user.split('@')[0]}</div>
                                        </td>
                                        <td style={{ padding: '1rem', border: 'none' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: log.action.includes('Login') ? 'var(--accent-secondary)' : 'var(--accent-tertiary)' }}>
                                                {log.action.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', border: 'none', borderRadius: '0 12px 12px 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                            {log.timestamp.split(' ')[1]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>System Health</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Server Load</span>
                                <span style={{ fontWeight: 800 }}>{stats?.active_sessions > 10 ? 'HIGH' : 'OPTIMAL'}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill shimmer-effect" style={{ width: stats?.active_sessions > 10 ? '85%' : '35%', background: stats?.active_sessions > 10 ? 'var(--error)' : 'var(--accent-secondary)' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>DB Connectivity</span>
                                <span style={{ fontWeight: 800 }}>99.9%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill shimmer-effect" style={{ width: '99.9%', background: 'var(--accent-secondary)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Add User Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Quick Add User</h2>
                        <form onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>Username</label>
                                <input type="text" className="form-input" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="form-input" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Initial Password</label>
                                <input type="password" className="form-input" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Role Assignment</label>
                                <select className="form-input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} style={{ background: 'var(--bg-dark)' }}>
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="hod">HOD</option>
                                    <option value="accountant">Accountant</option>
                                    <option value="vice_principal">Vice Principal</option>
                                </select>
                            </div>
                            {message.text && (
                                <div style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: message.type === 'error' ? 'var(--error)' : 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {message.text}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={submitting}>{submitting ? 'Creating...' : 'Create Account'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
