import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications } from '../../api/erpApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const stats = {
    total: applications.length || 0,
    enrolled: applications.filter(a => a.current_status === 'enrolled').length || 0,
    approved: applications.filter(a => a.current_status === 'approved').length || 0,
    pending: applications.filter(a => a.current_status === 'submitted' || a.current_status === 'under_review').length || 0,
  };

  const getMetric = (val, mock) => applications.length > 0 ? val : mock;

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    const days = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(<span key={`prev-${i}`} style={{ color: '#cbd5e1' }}>{daysInPrevMonth - i}</span>);
    }
    
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
      if (isToday) {
        days.push(<span key={`curr-${i}`} style={{ background: 'var(--erp-primary)', color: 'white', borderRadius: '4px', padding: '2px 0' }}>{i}</span>);
      } else {
        days.push(<span key={`curr-${i}`}>{i}</span>);
      }
    }
    
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
        days.push(<span key={`next-${i}`} style={{ color: '#cbd5e1' }}>{i}</span>);
    }
    
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <main className="erp-main" data-erp-page="Administrator / Dashboard">
      <div className="erp-page-header">
        <h1>Dashboard</h1>
        <p>Academic Year 2025-26 &middot; Last updated: {new Date().toLocaleString()}</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', justifyContent: 'flex-end' }}>
         <button className="erp-btn erp-btn--outline" onClick={() => navigate('/')}>
             <i className="fa-solid fa-graduation-cap"></i> Admission Module (Applicant View)
         </button>
         <button className="erp-btn erp-btn--outline"><i className="fa-solid fa-download"></i> Export</button>
         <button className="erp-btn erp-btn--primary"><i className="fa-solid fa-plus"></i> New Record</button>
      </div>

      {loading ? (
        <div>Loading dashboard metrics...</div>
      ) : (
        <>
          <div className="erp-form-grid-4" style={{ marginBottom: '24px' }}>
            <div className="erp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate('/admin/applications', { state: { filter: 'ALL' } })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '20px' }}>
                  <i className="fa-solid fa-users"></i>
                </div>
                <span style={{ color: 'var(--erp-success)', fontSize: '13px', fontWeight: 'bold' }}><i className="fa-solid fa-arrow-trend-up"></i> +4.2%</span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700' }}>{getMetric(stats.total, 2847).toLocaleString()}</h3>
              <p style={{ margin: 0, color: 'var(--erp-text-muted)', fontSize: '14px' }}>Total Applications</p>
            </div>
            
            <div className="erp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate('/admin/applications', { state: { filter: 'enrolled' } })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ background: '#ecfccb', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4d7c0f', fontSize: '20px' }}>
                  <i className="fa-solid fa-check-to-slot"></i>
                </div>
                <span style={{ color: 'var(--erp-success)', fontSize: '13px', fontWeight: 'bold' }}><i className="fa-solid fa-arrow-trend-up"></i> +2.1%</span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700' }}>{getMetric(stats.enrolled, 148)}</h3>
              <p style={{ margin: 0, color: 'var(--erp-text-muted)', fontSize: '14px' }}>Enrolled Students</p>
            </div>

            <div className="erp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate('/admin/applications', { state: { filter: 'approved' } })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ background: '#fffbeb', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309', fontSize: '20px' }}>
                  <i className="fa-solid fa-clipboard-check"></i>
                </div>
                <span style={{ color: 'var(--erp-danger)', fontSize: '13px', fontWeight: 'bold' }}><i className="fa-solid fa-arrow-trend-down"></i> -1.8%</span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700' }}>{getMetric(stats.approved, '86.4%')}</h3>
              <p style={{ margin: 0, color: 'var(--erp-text-muted)', fontSize: '14px' }}>Approvals Pending Payment</p>
            </div>

            <div className="erp-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => navigate('/admin/applications', { state: { filter: 'PENDING' } })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ background: '#ffe4e6', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#be123c', fontSize: '20px' }}>
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <span style={{ color: 'var(--erp-success)', fontSize: '13px', fontWeight: 'bold' }}><i className="fa-solid fa-arrow-trend-up"></i> +18%</span>
              </div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700' }}>{getMetric(stats.pending, 312)}</h3>
              <p style={{ margin: 0, color: 'var(--erp-text-muted)', fontSize: '14px' }}>Pending Review</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
            {/* Enrolment by Course Area */}
            <div className="erp-card">
              <div className="erp-card__header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div>
                   <h3 style={{ margin: '0 0 4px 0' }}>Enrolment by Course</h3>
                   <span style={{ color: 'var(--erp-text-muted)', fontSize: '13px' }}>Enrolled Students</span>
                </div>
              </div>
              <div className="erp-card__body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                   const courseCounts = {};
                   applications.forEach(app => {
                     const c = app.course_name || 'Unspecified';
                     courseCounts[c] = (courseCounts[c] || 0) + 1;
                   });
                   const courses = Object.keys(courseCounts).map(name => ({
                     name,
                     val: courseCounts[name],
                     // For UI progress bar visual, say target is 60 students per batch
                     percent: Math.min((courseCounts[name] / 60) * 100, 100)
                   }));
                   
                   if (courses.length === 0) {
                     return <div style={{color: 'var(--erp-text-muted)', fontSize: '13px'}}>No data available</div>;
                   }

                   return courses.map((course, idx) => {
                     const colors = ['var(--erp-primary)', 'var(--erp-success)', 'var(--erp-warning)'];
                     const color = colors[idx % colors.length];
                     return (
                      <div key={course.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
                          <span>{course.name}</span>
                          <span>{course.val} Students</span>
                        </div>
                        <div style={{ background: 'var(--erp-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${course.percent}%`, background: color, height: '100%', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                     );
                   });
                })()}
              </div>
            </div>

            {/* Dynamic Calendar Area */}
            <div className="erp-card">
              <div className="erp-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px' }}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
                <h3 style={{ margin: 0, fontSize: '15px' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button type="button" onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '8px' }}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>
              <div className="erp-card__body" style={{ textAlign: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '12px' }}>
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', fontSize: '13px', fontWeight: '500', color: '#334155' }}>
                  {renderCalendar()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
