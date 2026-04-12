import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApplications } from '../../api/erpApi';

export default function ApplicationsList() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(location.state?.filter || 'ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplications();
        // Since getApplications might return applications from applicants, 
        // we can filter them out or show all of them.
        setApplications(data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    const s = (status || 'draft').toLowerCase();
    if (s.includes('enrolled')) return <span className="erp-badge erp-badge--success" style={{ background: '#059669', color: 'white' }}>Enrolled</span>;
    if (s.includes('reject')) return <span className="erp-badge erp-badge--danger">Rejected</span>;
    if (s.includes('approv')) return <span className="erp-badge erp-badge--success">Approved</span>;
    if (s.includes('revision')) return <span className="erp-badge erp-badge--warning">Revision Req</span>;
    if (s.includes('submit')) return <span className="erp-badge erp-badge--primary">Pending</span>;
    return <span className="erp-badge erp-badge--secondary">{status}</span>;
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return ['submitted', 'under_review'].includes(app.current_status?.toLowerCase());
    return app.current_status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <main className="erp-main" data-erp-page="Administrator / Applications">
      <div className="erp-page-header">
        <h1>Applications List</h1>
        <p>Review and manage student admission applications.</p>
      </div>

      <div className="erp-card">
        <div className="erp-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="erp-card__title">All Applications</div>
          <div>
            <select className="erp-form-control" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto', display: 'inline-block' }}>
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="revision_required">Revision Required</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="enrolled">Enrolled</option>
            </select>
          </div>
        </div>
        <div className="erp-card__body">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="erp-table-responsive">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Applicant Name</th>
                    <th>Course</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length > 0 ? filteredApps.map(app => (
                    <tr key={app.application_id}>
                      <td>#{app.application_id}</td>
                      <td>{app.applicant_details?.full_name || 'N/A'}</td>
                      <td>{app.course_name}</td>
                      <td>{app.submission_date ? new Date(app.submission_date.endsWith('Z') ? app.submission_date : app.submission_date + 'Z').toLocaleDateString() : 'N/A'}</td>
                      <td>{getStatusBadge(app.current_status)}</td>
                      <td>
                        <button 
                          className="erp-btn erp-btn--sm erp-btn--primary"
                          onClick={() => navigate(`/admin/applications/${app.application_id}`)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '16px' }}>No applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
