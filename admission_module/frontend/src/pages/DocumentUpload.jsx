import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormStore from '../store/useFormStore';
import { uploadDocument, getUploadedDocuments } from '../api/erpApi';

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { global, setGlobalState } = useFormStore();

  const [files, setFiles] = useState({});
  const [uploadingKey, setUploadingKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const [showReplace, setShowReplace] = useState({}); // { docKey: boolean }
  const fileInputRefs = useRef({}); 

  const isReadOnly = ['submitted', 'under_review', 'approved', 'rejected', 'enrolled'].includes(global.status);

  const REQUIRED_DOCS = [
    { key: 'adhar_no', label: '1. Aadhar Card / Identity Proof', shortName: 'Aadhar Card' },
    { key: 'photo', label: '2. Passport Photograph', shortName: 'Photograph' },
    { key: 'signature', label: '3. Digital Signature', shortName: 'Digital Signature' }
  ];

  useEffect(() => {
    const loadDocuments = async () => {
      if (!global.applicationId) return;
      try {
        const docs = await getUploadedDocuments(global.applicationId);
        setDocuments(docs);
      } catch (err) {
        console.error(err);
      }
    };
    loadDocuments();
  }, [global.applicationId]);

  // Block access if no application ID
  if (!global.applicationId) {
    return (
      <main className="erp-main" data-erp-page="Applicant / Documents">
        <div className="erp-card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: 'var(--erp-text-muted)', marginBottom: '16px' }}></i>
          <h2>Documents Locked</h2>
          <p>Please complete your application form first.</p>
          <button className="erp-btn erp-btn--primary" onClick={() => navigate('/apply')}>Go to Application</button>
        </div>
      </main>
    );
  }

  const handleUpload = async (docType, docName) => {
    const fileToUpload = files[docType];
    if (!fileToUpload) return;

    setUploadingKey(docType);
    const formData = new FormData();
    formData.append('application_id', global.applicationId);
    formData.append('uploader_id', global.userId);
    formData.append('document_type', docType);
    formData.append('document_name', docName);
    formData.append('file', fileToUpload);

    try {
      const res = await uploadDocument(formData);
      setDocuments((prev) => {
        const existingIdx = prev.findIndex(d => d.document_type === res.document_type || d.doc_id === res.doc_id);
        if (existingIdx !== -1) {
          const next = [...prev];
          next[existingIdx] = res;
          return next;
        }
        return [...prev, res];
      });
      setFiles((prev) => { const next = {...prev}; delete next[docType]; return next; });
      setResetKey(prev => prev + 1);

      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show(`${docName} uploaded successfully.`, 'success');
      }
    } catch (err) {
      console.error(err);
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show(err.response?.data?.detail || 'Upload failed.', 'danger');
      }
    } finally {
      setUploadingKey(null);
    }
  };



  return (
    <main className="erp-main" data-erp-page="Applicant / Documents">
      <div className="erp-page-header">
        <h1>Document Uploads</h1>
        <p>Please upload necessary documentation to support your application.</p>
      </div>

      <div className="erp-form-grid-3">
        {/* Upload Panel */}
        <div className="erp-card" style={{ gridColumn: 'span 2' }}>
          <div className="erp-card__header">
            <div>
              <div className="erp-card__title">Required Documents</div>
              <div className="erp-card__subtitle">Max 1MB. Format: JPG, JPEG, PNG.</div>
            </div>
          </div>
          <div className="erp-card__body">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {REQUIRED_DOCS.map((doc) => {
                const uploadedDoc = documents.find((d) => d.document_name === doc.shortName);
                const isUploaded = !!uploadedDoc;
                const isUploading = uploadingKey === doc.key;
                const fileSelected = files[doc.key];
                
                const isRejected = uploadedDoc?.status === 'Rejected';
                const latestRemark = uploadedDoc?.verifications?.length > 0 
                  ? [...uploadedDoc.verifications].sort((a,b) => b.verification_id - a.verification_id)[0].remarks 
                  : null;

                return (
                  <div key={doc.key} className="erp-card" style={{ padding: '20px', position: 'relative', border: '1px solid var(--erp-border)', background: 'white' }}>
                    {/* Badge in Top Right */}
                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                      {isUploaded && (() => {
                        const st = uploadedDoc.status.toLowerCase();
                        let badgeClass = 'erp-badge--primary';
                        if (st === 'verified') badgeClass = 'erp-badge--success';
                        else if (st === 'rejected') badgeClass = 'erp-badge--danger';
                        
                        return (
                          <span className={`erp-badge ${badgeClass}`} style={{ fontSize: '11px', padding: '4px 10px' }}>
                            <i className={`fa-solid ${st === 'verified' ? 'fa-check' : st === 'rejected' ? 'fa-xmark' : 'fa-clock'}`} style={{ marginRight: '4px' }}></i>
                            {uploadedDoc.status}
                          </span>
                        );
                      })()}
                    </div>

                    <div style={{ paddingRight: '120px' }}>
                       <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>{doc.label}</h4>
                    </div>
                    
                    {isUploaded ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                          <div style={{ width: '100px', height: '100px', background: 'var(--erp-bg)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--erp-border)' }}>
                            <img 
                              src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/documents/preview/${uploadedDoc.file_path.split(/[\/\\]/).pop()}`} 
                              alt={doc.shortName}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=File'; }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{doc.shortName}</div>
                            <div style={{ color: 'var(--erp-text-muted)', fontSize: '13px' }}>Securely stored in the application locker.</div>
                            <a 
                              href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/documents/preview/${uploadedDoc.file_path.split(/[\/\\]/).pop()}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ display: 'inline-block', marginTop: '10px', color: 'var(--erp-primary)', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginRight: '6px' }}></i> View Full Size
                            </a>
                          </div>
                        </div>

                        {/* Admin Remark for Rejected Doc */}
                        {isRejected && (
                          <div className="erp-alert erp-alert--danger" style={{ margin: 0, padding: '12px', fontSize: '13px', borderLeft: '4px solid var(--erp-danger)' }}>
                            <strong><i className="fa-solid fa-circle-info"></i> Remark:</strong> {latestRemark || 'Document not clear. Please re-upload.'}
                          </div>
                        )}

                        {/* Replacement Option (If not read-only) */}
                        {!isReadOnly && (
                          <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px dashed var(--erp-border)' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--erp-text-muted)', marginBottom: '8px' }}>
                              <i className="fa-solid fa-arrows-rotate"></i> UPDATE OR REPLACE DOCUMENT
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input 
                                key={`input-${doc.key}-${resetKey}`}
                                type="file" 
                                className="erp-form-control" 
                                onChange={e => setFiles({ ...files, [doc.key]: e.target.files[0] })}
                                style={{ maxWidth: '300px' }}
                              />
                              <button 
                                className="erp-btn erp-btn--outline" 
                                onClick={() => handleUpload(doc.key, doc.shortName)}
                                disabled={isUploading || !fileSelected}
                              >
                                {isUploading ? 'Uploading...' : 'Replace File'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {isReadOnly ? (
                          <div className="erp-alert erp-alert--danger" style={{ margin: 0, padding: '10px 15px', borderRadius: '8px', fontSize: '14px' }}>
                            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '8px' }}></i>
                            Missing Document. Application is currently locked.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px' }}>
                             <input 
                                type="file" 
                                className="erp-form-control" 
                                onChange={e => setFiles({ ...files, [doc.key]: e.target.files[0] })}
                             />
                             <button 
                                className="erp-btn erp-btn--primary" 
                                onClick={() => handleUpload(doc.key, doc.shortName)}
                                disabled={isUploading || !fileSelected}
                             >
                                {isUploading ? 'Uploading...' : 'Upload'}
                             </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                 className="erp-btn erp-btn--secondary"
                 onClick={() => navigate('/apply')}
              >
                 &larr; Back to Form
              </button>
              
              <button
                 className="erp-btn erp-btn--primary"
                 onClick={() => navigate('/preview')}
              >
                 Next: Application Preview &rarr;
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
