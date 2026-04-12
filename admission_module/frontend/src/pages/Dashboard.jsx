import React, { useEffect } from 'react';
import useFormStore from '../store/useFormStore';
import { useNavigate } from 'react-router-dom';
import { getApplicationStatusTracking } from '../api/erpApi';
import themeConfig from '../theme/themeConfig';

export default function Dashboard() {
  const { global, setGlobalState } = useFormStore();
  const navigate = useNavigate();

  useEffect(() => {
    const syncStatus = async () => {
      if (global.applicationId) {
        try {
          const logs = await getApplicationStatusTracking(global.applicationId);
          if (logs && logs.length > 0) {
            const sortedLogs = [...logs].sort((a, b) => new Date(b.changed_at.endsWith('Z') ? b.changed_at : b.changed_at + 'Z') - new Date(a.changed_at.endsWith('Z') ? a.changed_at : a.changed_at + 'Z'));
            const latestStatus = sortedLogs[0].status_id;
            if (latestStatus !== global.status) {
              setGlobalState({ status: latestStatus });
            }
          }
        } catch (err) {
          console.error('Failed to sync status:', err);
          // NEW: Self-Healing Logic
          if (err.response && err.response.status === 404) {
             console.warn("Application ID no longer exists on server. Resetting local state.");
             setGlobalState({ applicationId: null, status: 'paid_brochure' });
             if (window.ERP && window.ERP.Toast) {
                window.ERP.Toast.show("Your session was out of sync. Please start your application again.", "warning");
             }
          }
        }
      }
    };
    syncStatus();
  }, [global.applicationId, global.status, setGlobalState]);

  const getProgressDetails = () => {
    switch (global.status) {
      case 'pending_brochure': return { percent: 10, label: 'Brochure Purchase Pending',   stage: 0 };
      case 'paid_brochure':    return { percent: 25, label: 'Admission Form Unlocked',   stage: 1 };
      case 'draft_application':return { percent: 60, label: 'Document Upload Pending',   stage: 2 };
      case 'submitted':        return { percent: 80, label: 'Submitted (Reviewing)', stage: 3 };
      case 'under_review':     return { percent: 80, label: 'Under Review', stage: 3 };
      case 'revision_required':return { percent: 70, label: 'Revision Required', stage: 2 };
      case 'rejected':         return { percent: 100, label: 'Application Rejected', stage: 3 };
      case 'approved':         return { percent: 100, label: 'Approved. Pending Payment', stage: 4 };
      case 'enrolled':         return { percent: 100, label: 'Fully Enrolled', stage: 5 };
      default:                 return { percent: 0,  label: global.status || 'Checking', stage: 0 };
    }
  };

  const progress = getProgressDetails();
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.percent / 100) * circumference;

  const JOURNEY = [
    { title: 'Brochure',   icon: 'fa-solid fa-book-open' },
    { title: 'Application',icon: 'fa-solid fa-file-pen' },
    { title: 'Documents',  icon: 'fa-solid fa-file-arrow-up' },
    { title: 'Review',     icon: 'fa-solid fa-user-shield' },
    { title: 'Payment',    icon: 'fa-solid fa-money-check-dollar' }
  ];

  return (
    <main className="erp-main" data-erp-page="Applicant / Dashboard">
      <div className="erp-page-header">
        <h1>Welcome back to {themeConfig.collegeName}</h1>
        <p>{themeConfig.moduleLabel} dashboard for current applicants.</p>
      </div>

      {/* Horizontal Journey Stepper */}
      <div className="erp-card" style={{ marginBottom: 24, padding: '24px 32px' }}>
        <h4 style={{ margin: '0 0 24px 0', color: 'var(--erp-text)' }}>Your Admission Journey</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {/* Background Track Line */}
          <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', background: 'var(--erp-border)', zIndex: 0, borderRadius: '2px' }}></div>
          {/* Active Track Line */}
          <div style={{ 
            position: 'absolute', top: '24px', left: '10%', 
            width: `${Math.min((progress.stage / (JOURNEY.length - 1)) * 80, 80)}%`, 
            height: '4px', background: 'var(--erp-primary)', zIndex: 1, borderRadius: '2px', transition: 'width 0.5s ease-out' 
          }}></div>

          {JOURNEY.map((step, idx) => {
            const isActive = idx === progress.stage;
            const isCompleted = idx < progress.stage;
            const isFuture = idx > progress.stage;
            
            let bgColor = 'var(--erp-surface)';
            let iconColor = 'var(--erp-text-muted)';
            let borderColor = 'var(--erp-border)';
            let glow = 'none';

            if (isCompleted) {
              bgColor = 'var(--erp-success)';
              iconColor = 'white';
              borderColor = 'var(--erp-success)';
            } else if (isActive) {
              bgColor = 'var(--erp-primary)';
              iconColor = 'white';
              borderColor = 'var(--erp-primary)';
              glow = '0 0 0 6px #e0e7ff';
            }

            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, width: '120px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%', background: bgColor, border: `2px solid ${borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, fontSize: '20px',
                  boxShadow: glow, transition: 'all 0.3s ease', marginBottom: '12px'
                }}>
                  <i className={isCompleted ? 'fa-solid fa-check' : step.icon}></i>
                </div>
                <span style={{ fontSize: '14px', fontWeight: isActive ? '600' : '500', color: isFuture ? 'var(--erp-text-muted)' : 'var(--erp-text)' }}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="erp-form-grid-3">
        {/* Profile Completion Circular Ring */}
        <div className="erp-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 24px 0', color: 'var(--erp-text)' }}>Profile Completion</h4>
          
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background SVG Circle */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="var(--erp-border)" strokeWidth="12" />
              {/* Dynamic Progress Circle */}
              <circle 
                cx="60" cy="60" r={radius} fill="transparent" stroke="var(--erp-primary)" 
                strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--erp-text)' }}>
              {progress.percent}%
            </div>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <div className="erp-badge erp-badge--primary" style={{ fontSize: '13px' }}>{progress.label}</div>
          </div>
        </div>

        {/* Action Center Info Card */}
        <div className="erp-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
          <div className="erp-card__header">
            <div className="erp-card__title">Next Steps & Action Center</div>
          </div>
          <div className="erp-card__body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {global.status === 'pending_brochure' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-text-muted)' }}><i className="fa-solid fa-money-check-dollar"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0' }}>Step 1: Obtain a Brochure</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>You must request and pay for your dedicated admission brochure to securely unlock the main application portal.</p>
                   <button className="erp-btn erp-btn--primary" onClick={() => navigate('/brochure')}>Go to Brochure Purchasing</button>
                 </div>
              </div>
            )}
            {global.status === 'paid_brochure' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-text-muted)' }}><i className="fa-solid fa-pen-to-square"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0' }}>Step 2: Fill Application Form</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>Your portal is officially unlocked! Please fill out your digital admission application schema accurately.</p>
                   <button className="erp-btn erp-btn--primary" onClick={() => navigate('/apply')}>Start Secure Application</button>
                 </div>
              </div>
            )}
            {global.status === 'draft_application' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-text-muted)' }}><i className="fa-solid fa-cloud-arrow-up"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0' }}>Step 3: Upload Mandatory Documents</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>Your form data is saved as a secure draft. Now upload the required files (Aadhar, Signature, Photo) to dispatch the application.</p>
                   <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="erp-btn erp-btn--primary" onClick={() => navigate('/documents')}>Proceed to Documents</button>
                      <button 
                        className="erp-btn erp-btn--outline" 
                        onClick={() => {
                          if (confirm("This will refresh your local application ID to sync with the database. Your form data will be preserved. Proceed?")) {
                             setGlobalState({ applicationId: null });
                             window.location.reload();
                          }
                        }}
                        title="Fix sync issues between browser and server"
                      >
                         <i className="fa-solid fa-wrench" style={{ marginRight: '8px' }}></i>
                         Repair ID Sync
                      </button>
                   </div>
                 </div>
              </div>
            )}
            {global.status === 'submitted' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-primary)' }}><i className="fa-solid fa-shield-check"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0', color: 'var(--erp-primary)' }}>Your application is under review</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>It has been successfully submitted. You currently have a read-only view until the administrative team processes it.</p>
                   <button className="erp-btn erp-btn--outline" onClick={() => navigate('/status')}>View Status Ledger</button>
                 </div>
              </div>
            )}
            {global.status === 'under_review' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-primary)' }}><i className="fa-solid fa-magnifying-glass"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0', color: 'var(--erp-primary)' }}>Our team is reviewing your application</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>No actions are required from your side at this moment. You will be notified of the result.</p>
                   <button className="erp-btn erp-btn--outline" onClick={() => navigate('/status')}>View Status Ledger</button>
                 </div>
              </div>
            )}
            {global.status === 'revision_required' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-warning)' }}><i className="fa-solid fa-triangle-exclamation"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0', color: 'var(--erp-warning)' }}>Revision Required</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>The admin team has requested corrections. Please correct the highlighted fields or documents.</p>
                   <button className="erp-btn erp-btn--warning" onClick={() => navigate('/apply')}>Edit Application</button>
                   <button className="erp-btn erp-btn--outline" onClick={() => navigate('/status')} style={{ marginLeft: '8px' }}>View Admin Comments</button>
                 </div>
              </div>
            )}
            {global.status === 'rejected' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-danger)' }}><i className="fa-solid fa-circle-xmark"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0', color: 'var(--erp-danger)' }}>Application Rejected</h3>
                   <p style={{ color: 'var(--erp-danger)', lineHeight: '1.5', margin: '0 0 16px 0' }}>Unfortunately, your application was not approved. Check the status tracker for the clear rejection message and reason.</p>
                   <button className="erp-btn erp-btn--danger" onClick={() => navigate('/status')}>View Rejection Reason</button>
                 </div>
              </div>
            )}
            {global.status === 'approved' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: 'var(--erp-success)' }}><i className="fa-solid fa-clipboard-check"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0', color: 'var(--erp-success)' }}>Application Approved!</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>Congratulations! Your application is approved. Next Step: Pay admission fees to confirm enrollment.</p>
                   <button className="erp-btn erp-btn--success" onClick={() => navigate('/payment')}>Proceed to Payment</button>
                 </div>
              </div>
            )}
            {global.status === 'enrolled' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                 <div style={{ fontSize: '40px', color: '#059669' }}><i className="fa-solid fa-graduation-cap"></i></div>
                 <div>
                   <h3 style={{ margin: '0 0 8px 0', color: '#059669' }}>Enrolled Successfully!</h3>
                   <p style={{ color: 'var(--erp-text-muted)', lineHeight: '1.5', margin: '0 0 16px 0' }}>Congratulations! You have completed all admission procedures and are officially enrolled. Your student journey begins now.</p>
                   <button className="erp-btn erp-btn--success" onClick={() => navigate('/preview')} style={{ background: '#059669' }}>
                     <i className="fa-solid fa-print" style={{ marginRight: '8px' }}></i> Download Docket
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
