import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationDetails, submitReview, getUploadedDocuments, verifyDocument } from '../../api/erpApi';
import useAuthStore from '../../store/useAuthStore';
import themeConfig from '../../theme/themeConfig';

export default function ApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [showModal, setShowModal] = useState(false);
  const [reviewAction, setReviewAction] = useState(''); // 'Approve', 'Reject', 'Revision Required'
  const [remarks, setRemarks] = useState('');
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const appData = await getApplicationDetails(id);
        setApplication(appData);
        
        const docsData = await getUploadedDocuments(id);
        setDocuments(docsData || []);
      } catch (err) {
        if (window.ERP && window.ERP.Toast) {
          window.ERP.Toast.show(err.message, 'danger');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [id]);

  const handleActionClick = (actionStr) => {
    setReviewAction(actionStr);
    setRemarks('');
    setShowModal(true);
  };

  const handleConfirmReview = async () => {
    if ((reviewAction === 'Reject' || reviewAction === 'Revision Required') && !remarks.trim()) {
      alert("Remarks are mandatory for Rejection or Revision requests.");
      return;
    }
    
    setSubmitting(true);
    try {
      await submitReview({
        application_id: parseInt(id, 10),
        admin_id: currentUser.id,
        action: reviewAction,
        remarks: remarks.trim() || `${reviewAction} automatically.`
      });
      
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show(`Application ${reviewAction} successfully.`, 'success');
      }
      setShowModal(false);
      navigate('/admin/applications');
      navigate('/admin/applications');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocVerification = async (docId, actionStr) => {
    try {
      await verifyDocument({
        document_id: docId,
        admin_id: currentUser.id,
        status: actionStr,
        remarks: `Document ${actionStr} by Admin.`
      });
      // Locally update state without full refetch
      setDocuments(docs => docs.map(d => d.doc_id === docId ? { ...d, status: actionStr } : d));
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show(`Document marked as ${actionStr}`, 'success');
      }
    } catch (err) {
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show(err.message, 'danger');
      }
    }
  };

  if (loading) return <main className="erp-main" style={{ padding: '24px' }}>Loading application details...</main>;
  if (!application) return <main className="erp-main" style={{ padding: '24px' }}>Application not found.</main>;

  const applicant = application.applicant_details || {};
  const parent = application.parent_details || {};
  const education = application.education_details || [];

  return (
    <main className="erp-main" data-erp-page="Administrator / Application Detailed Review">
      <div className="erp-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button className="erp-btn erp-btn--secondary erp-btn--sm" onClick={() => navigate('/admin/applications')} style={{ marginBottom: '8px' }}>
            &larr; Back to List
          </button>
          <h1>Reviewing Application #{application.application_id}</h1>
          <p>Status: <strong style={{ textTransform: 'uppercase' }}>{application.current_status}</strong> | Course: {application.course_name}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="erp-btn erp-btn--warning" onClick={() => handleActionClick('Revision Required')}>Request Revision</button>
          <button className="erp-btn erp-btn--danger" onClick={() => handleActionClick('Reject')}>Reject</button>
          <button className="erp-btn erp-btn--success" onClick={() => handleActionClick('Approve')}>Approve</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Applicant Details */}
        <section className="erp-card">
          <div className="erp-card__header">
            <div className="erp-card__title">Applicant Details</div>
          </div>
          <div className="erp-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>Full Name:</strong> {applicant.full_name}</div>
              <div><strong>Email:</strong> {applicant.email}</div>
              <div><strong>Mobile:</strong> {applicant.mobile_number}</div>
              <div><strong>DOB:</strong> {applicant.dob}</div>
              <div><strong>Gender:</strong> {applicant.gender}</div>
              <div><strong>Aadhaar:</strong> {applicant.adhar_number}</div>
              <div><strong>Category:</strong> {applicant.caste_category}</div>
            </div>
            
            <h4 style={{ marginTop: '24px', borderBottom: '1px solid var(--erp-border)', paddingBottom: '8px' }}>Addresses</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div>
                <strong>Permanent Address:</strong>
                <p style={{ margin: '4px 0 0' }}>{applicant.perm_area}, {applicant.perm_city}, {applicant.perm_district}, {applicant.perm_state} - {applicant.perm_pin}</p>
              </div>
              <div>
                <strong>Temporary Address:</strong>
                <p style={{ margin: '4px 0 0' }}>{applicant.temp_area}, {applicant.temp_city}, {applicant.temp_district}, {applicant.temp_state} - {applicant.temp_pin}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Parent Details */}
        <section className="erp-card">
          <div className="erp-card__header">
            <div className="erp-card__title">Parent / Guardian Details</div>
          </div>
          <div className="erp-card__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong>{parent.parent_relationship || 'Parent'} Name:</strong> {parent.name}</div>
              <div><strong>Mother Name:</strong> {parent.mother_name}</div>
              <div><strong>Mobile:</strong> {parent.mobile_number}</div>
              <div><strong>Occupation:</strong> {parent.occupation || 'N/A'}</div>
              <div><strong>Annual Income:</strong> ₹{parent.annual_income}</div>
            </div>
          </div>
        </section>

        {/* Education Details */}
        <section className="erp-card">
          <div className="erp-card__header">
            <div className="erp-card__title">Education Details</div>
          </div>
          <div className="erp-card__body">
            <div className="erp-table-responsive">
              <table className="erp-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th>Qualification</th>
                    <th>Institution</th>
                    <th>Board/Univ</th>
                    <th>Pass Year</th>
                    <th>Marks</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map(edu => (
                    <tr key={edu.education_id}>
                      <td>{edu.last_qualification_level}</td>
                      <td>{edu.last_institution_college_name}</td>
                      <td>{edu.university_board}</td>
                      <td>{edu.passout_year}</td>
                      <td>{edu.obtained_marks} / {edu.total_marks}</td>
                      <td>{edu.percentage ? edu.percentage.toFixed(2) : '-'}%</td>
                    </tr>
                  ))}
                  {education.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No education records.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Uploaded Documents */}
        <section className="erp-card">
          <div className="erp-card__header">
            <div className="erp-card__title">Uploaded Documents</div>
          </div>
          <div className="erp-card__body">
            {documents.length > 0 ? (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                 {documents.map(doc => {
                   const fileName = doc.file_path?.split(/[\/\\]/).pop();
                   const backendHost = window.location.hostname;
                   const previewUrl = fileName ? `http://${backendHost}:8001/documents/preview/${fileName}` : '#';
                   
                   return (
                     <div key={doc.doc_id} style={{ 
                       border: '1px solid var(--erp-border)', 
                       padding: '16px', 
                       borderRadius: '12px', 
                       minWidth: '240px',
                       background: 'var(--erp-bg-card)',
                       boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                     }}>
                       <div style={{ fontWeight: 'bold', marginBottom: '12px', textTransform: 'capitalize', fontSize: '16px' }}>
                         {doc.document_type.replace('_', ' ')}
                       </div>
                       
                       {/* Image Thumbnail */}
                       <div style={{ 
                         width: '100%', 
                         height: '150px', 
                         background: '#f8fafc',
                         borderRadius: '8px',
                         marginBottom: '16px',
                         overflow: 'hidden',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         border: '1px solid var(--erp-border)'
                       }}>
                         {fileName ? (
                           <img 
                            src={previewUrl} 
                            alt={doc.document_type} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/200x150?text=No+Preview';
                              e.target.onerror = null;
                            }}
                           />
                         ) : (
                           <span style={{ fontSize: '12px', color: 'var(--erp-text-muted)' }}>No File Uploaded</span>
                         )}
                       </div>

                       <div style={{ marginBottom: '12px' }}>
                          Status:{' '}
                          <span className={`erp-badge ${doc.status === 'Verified' ? 'erp-badge--success' : doc.status === 'Rejected' ? 'erp-badge--danger' : 'erp-badge--warning'}`}>
                            {doc.status || 'Pending'}
                          </span>
                       </div>
                       
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                         <a href={previewUrl} target="_blank" rel="noreferrer" className="erp-btn erp-btn--sm erp-btn--dark" style={{ textAlign: 'center', width: '100%' }}>
                           <i className="fa-solid fa-up-right-from-square" style={{ marginRight: '6px' }}></i> View Full Size
                         </a>
                         {(doc.status === 'Pending' || doc.status === 'Rejected') && (
                           <div style={{ display: 'flex', gap: '8px' }}>
                             <button onClick={() => handleDocVerification(doc.doc_id, 'Verified')} className="erp-btn erp-btn--sm erp-btn--success" style={{ flex: 1 }}>Verify</button>
                             {doc.status !== 'Rejected' && <button onClick={() => handleDocVerification(doc.doc_id, 'Rejected')} className="erp-btn erp-btn--sm erp-btn--danger" style={{ flex: 1 }}>Reject</button>}
                           </div>
                         )}
                       </div>
                     </div>
                   );
                 })}
              </div>
            ) : (
              <p>No documents uploaded yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Review Modal using theme styles conceptually */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="erp-card" style={{ width: '400px', maxWidth: '90%' }}>
            <div className="erp-card__header">
              <div className="erp-card__title">Confirm: {reviewAction}</div>
            </div>
            <div className="erp-card__body">
              <div className="erp-form-group">
                <label>Admin Remarks / Reason {(reviewAction === 'Reject' || reviewAction === 'Revision Required') && <span style={{color: 'red'}}>*</span>}</label>
                <textarea 
                  className="erp-form-control" 
                  rows="4"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={`Enter reason for ${reviewAction.toLowerCase()}...`}
                ></textarea>
                {reviewAction === 'Revision Required' && (
                  <small style={{ marginTop: '8px', display: 'block', color: 'var(--erp-text-muted)' }}>
                    These remarks will be shown directly to the user so they know exactly what to correct.
                  </small>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button className="erp-btn erp-btn--secondary" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
                <button 
                  className={`erp-btn ${reviewAction === 'Reject' ? 'erp-btn--danger' : reviewAction === 'Approve' ? 'erp-btn--success' : 'erp-btn--primary'}`} 
                  onClick={handleConfirmReview}
                  disabled={submitting}
                >
                  {submitting ? 'Confirming...' : `Confirm ${reviewAction}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
