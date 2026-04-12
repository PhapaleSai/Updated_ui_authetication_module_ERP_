import React, { useEffect, useState } from 'react';
import { getApplicationStatusTracking } from '../api/erpApi';
import useFormStore from '../store/useFormStore';

export default function ApplicationStatus() {
  const { global } = useFormStore();
  const [statusLogs, setStatusLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStatus = async () => {
      if (!global.applicationId) return;
      setLoading(true);
      try {
        const data = await getApplicationStatusTracking(global.applicationId);
        setStatusLogs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, [global.applicationId]);

  const steps = [
    { id: 'submitted', label: 'Submitted', icon: 'fa-paper-plane' },
    { id: 'under_review', label: 'Review', icon: 'fa-magnifying-glass' },
    { id: 'approved', label: 'Approved', icon: 'fa-thumbs-up' },
    { id: 'enrolled', label: 'Enrolled', icon: 'fa-graduation-cap' }
  ];

  const getCurrentStepIndex = () => {
    const s = (global.status || '').toLowerCase();
    if (s === 'enrolled') return 3;
    if (s === 'approved') return 2;
    if (['under_review', 'revision_required', 'pending_verification'].includes(s)) return 1;
    if (['submitted'].includes(s)) return 0;
    return -1; // Draft or pending brochure
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStatusVisuals = (statusId = '') => {
    const s = statusId.toUpperCase();
    if (s.includes('REJECT') || s.includes('FAIL') || s.includes('ERROR')) {
      return { color: '#ef4444', icon: 'fa-solid fa-xmark', bg: 'rgba(239, 68, 68, 0.1)', border: '#fca5a5' };
    }
    if (s.includes('VERIF') || s.includes('APPROV') || s.includes('SUCCESS')) {
      return { color: '#10b981', icon: 'fa-solid fa-check', bg: 'rgba(16, 185, 129, 0.1)', border: '#6ee7b7' };
    }
    if (s.includes('ENROLL')) {
      return { color: '#6366f1', icon: 'fa-solid fa-graduation-cap', bg: 'rgba(99, 102, 241, 0.1)', border: '#a5b4fc' };
    }
    if (s.includes('UPLOAD') || s.includes('SUBMIT')) {
      return { color: '#3b82f6', icon: 'fa-solid fa-arrow-up', bg: 'rgba(59, 130, 246, 0.1)', border: '#93c5fd' };
    }
    return { color: '#f59e0b', icon: 'fa-solid fa-clock-rotate-left', bg: 'rgba(245, 158, 11, 0.1)', border: '#fcd34d' };
  };

  const formatStatusId = (id) => id.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  return (
    <main className="erp-main" data-erp-page="Applicant / Status Tracking" style={{ padding: '24px' }}>
      <div className="erp-page-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '8px', background: 'linear-gradient(to right, var(--erp-primary), #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Application Processing Timeline
        </h1>
        <p style={{ color: 'var(--erp-text-muted)', fontSize: '1.1rem' }}>Tracking your progress towards official enrollment.</p>
      </div>

      {/* Modern Progress Stepper */}
      <div className="erp-card stepper-card" style={{ marginBottom: '40px', padding: '32px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)' }}>
        <div className="stepper-container">
          {/* Background Line (Desktop) */}
          <div className="stepper-line-bg"></div>
          {/* Active Line (Desktop) */}
          <div className="stepper-line-active" style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            let bgColor = 'white';
            let iconColor = 'var(--erp-text-muted)';

            if (isCompleted || isActive) {
              bgColor = 'var(--erp-primary)';
              iconColor = 'white';
            }

            return (
              <div key={step.id} className={`stepper-item ${isActive ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''}`}>
                <div className="stepper-icon-wrapper" style={{ background: bgColor, color: iconColor }}>
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <span className="stepper-label">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>


      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '24px', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fa-solid fa-list-ul" style={{ color: 'var(--erp-primary)' }}></i>
          Detailed Activity Log
        </h3>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--erp-text-muted)' }}><i className="fa-solid fa-circle-notch fa-spin"></i> Loading updates...</div>}
        {error && <div className="erp-alert erp-alert--warning">{error}</div>}
        
        {!loading && !global.applicationId && (
          <div className="erp-card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: 'var(--erp-text-muted)', marginBottom: '16px' }}></i>
            <h3>No Application Found</h3>
            <p>Complete your application to start tracking your status.</p>
          </div>
        )}

        {statusLogs.length > 0 ? (() => {
          const sortedLogs = [...statusLogs].sort((a, b) => new Date(b.changed_at.endsWith('Z') ? b.changed_at : b.changed_at + 'Z') - new Date(a.changed_at.endsWith('Z') ? a.changed_at : a.changed_at + 'Z'));

          return (
            <div style={{ position: 'relative', paddingLeft: '20px' }}>
              {/* Vertical line with gradient */}
              <div style={{
                position: 'absolute',
                top: '0',
                bottom: '0',
                left: '0',
                width: '4px',
                background: 'linear-gradient(to bottom, var(--erp-primary), var(--erp-border))',
                borderRadius: '2px',
                zIndex: 0
              }}></div>

              {sortedLogs.map((log, index) => {
                const { color, icon, bg, border } = getStatusVisuals(log.status_id);
                const isLatest = index === 0;

                return (
                  <div key={log.status_log_id} style={{ position: 'relative', paddingLeft: '40px', marginBottom: '32px' }}>
                    {/* Pulsing Dot for Latest */}
                    <div style={{
                      position: 'absolute',
                      left: '-8px',
                      top: '20px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      border: `4px solid ${isLatest ? 'var(--erp-primary)' : 'var(--erp-border)'}`,
                      zIndex: 1,
                      boxShadow: isLatest ? '0 0 15px var(--erp-primary)' : 'none'
                    }}>
                      {isLatest && <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', background: 'var(--erp-primary)', opacity: 0.3, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div>}
                    </div>

                    {/* Glassmorphic Card */}
                    <div className="status-log-card" style={{ 
                      background: isLatest ? 'white' : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${isLatest ? 'var(--erp-primary)' : 'rgba(255, 255, 255, 0.5)'}`,
                      borderRadius: '20px',
                      padding: '24px',
                      boxShadow: isLatest ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'default'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <i className={icon} style={{ fontSize: '14px' }}></i>
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: isLatest ? 'var(--erp-text)' : 'var(--erp-text-muted)' }}>
                              {formatStatusId(log.status_id)}
                            </h4>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--erp-text-muted)', fontWeight: '500' }}>
                            {new Date(log.changed_at.endsWith('Z') ? log.changed_at : log.changed_at + 'Z').toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
                          </span>
                        </div>
                        {isLatest && (
                          <span style={{ background: 'var(--erp-primary)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                            LATEST UPDATE
                          </span>
                        )}
                      </div>

                      <p style={{ margin: '0 0 20px', color: 'var(--erp-text)', lineHeight: '1.6', fontSize: '15px' }}>
                        {log.remark || 'Your application status was updated by the system.'}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px dashed var(--erp-border)' }}>
                        <div style={{ 
                          width: '28px', height: '28px', borderRadius: '50%', 
                          background: log.changed_role === 'Admin' ? '#fee2e2' : '#e0e7ff',
                          color: log.changed_role === 'Admin' ? '#ef4444' : '#3b82f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                        }}>
                          <i className={log.changed_role === 'Admin' ? 'fa-solid fa-user-shield' : 'fa-solid fa-user'}></i>
                        </div>
                        <span style={{ fontSize: '13px', color: 'var(--erp-text-muted)' }}>
                          Processed by <strong style={{ color: 'var(--erp-text)' }}>{log.changed_role || 'System'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })() : !loading && global.applicationId ? (
          <div className="erp-card" style={{ textAlign: 'center', padding: '40px' }}>
            <i className="fa-solid fa-hourglass-start" style={{ fontSize: '48px', color: 'var(--erp-text-muted)', marginBottom: '16px' }}></i>
            <p>Waiting for the first workflow update...</p>
          </div>
        ) : null}
      </div>

      <style>{`
        .stepper-container {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        .stepper-line-bg {
          position: absolute;
          top: 24px;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--erp-border);
          z-index: 0;
        }
        .stepper-line-active {
          position: absolute;
          top: 24px;
          left: 0;
          height: 4px;
          background: linear-gradient(to right, var(--erp-primary), #6366f1);
          transition: width 1s ease-in-out;
          z-index: 1;
        }
        .stepper-item {
          z-index: 2;
          text-align: center;
          width: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stepper-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justifyContent: center;
          margin-bottom: 12px;
          border: 4px solid white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stepper-item.is-active .stepper-icon-wrapper {
          transform: scale(1.15);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
          border-color: rgba(99, 102, 241, 0.2);
        }
        .stepper-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--erp-text-muted);
        }
        .stepper-item.is-active .stepper-label {
          font-weight: 700;
          color: var(--erp-text);
        }

        @media (max-width: 768px) {
          .stepper-container {
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
          }
          .stepper-line-bg, .stepper-line-active {
            display: none;
          }
          .stepper-item {
            flex-direction: row;
            width: 100%;
            text-align: left;
            gap: 16px;
          }
          .stepper-icon-wrapper {
            margin-bottom: 0;
            width: 40px;
            height: 40px;
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .status-log-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
      `}</style>
    </main>
  );
}

