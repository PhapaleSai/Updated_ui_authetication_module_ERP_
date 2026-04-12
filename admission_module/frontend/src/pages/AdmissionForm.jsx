import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormStore from '../store/useFormStore';
import { submitApplication, updateApplication, getApplicationStatusTracking } from '../api/erpApi';

export default function AdmissionForm() {
  const navigate = useNavigate();
  const { global, setGlobalState, formData, updateApplicant, updateParent, updateEducation, addEducation, removeEducation } = useFormStore();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDuplicatePrompt, setShowDuplicatePrompt] = useState(false);

  useEffect(() => {
    const syncStatus = async () => {
      if (global.applicationId) {
        try {
          const logs = await getApplicationStatusTracking(global.applicationId);
          if (logs && logs.length > 0) {
            const sortedLogs = [...logs].sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
            const latestStatus = sortedLogs[0].status_id;
            if (latestStatus !== global.status) {
              setGlobalState({ status: latestStatus });
            }
          }
        } catch (err) {
          console.error('Failed to sync status:', err);
          if (err.response && err.response.status === 404) {
             console.warn("Application ID no longer exists on server. Resetting local state.");
             setGlobalState({ applicationId: null, status: 'paid_brochure' });
             if (window.ERP && window.ERP.Toast) {
                window.ERP.Toast.show("Your application data was out of sync. Please start again.", "warning");
             }
             navigate('/');
          }
        }
      }
    };
    syncStatus();
  }, [global.applicationId, global.status, setGlobalState]);

  if (global.status === 'pending_brochure') {
    return (
      <main className="erp-main" data-erp-page="Applicant / Application">
        <div className="erp-card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: 'var(--erp-text-muted)', marginBottom: '16px' }}></i>
          <h2>Application Locked</h2>
          <p>You must purchase a brochure to unlock the admission form.</p>
          <button className="erp-btn erp-btn--primary" onClick={() => navigate('/brochure')}>Go to Brochure</button>
        </div>
      </main>
    );
  }

  const isReadOnly = ['submitted', 'under_review', 'approved', 'rejected', 'enrolled'].includes(global.status);
  
  if (global.status === 'draft_application') {
    return (
      <main className="erp-main" data-erp-page="Applicant / Application">
        <div className="erp-card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '48px', color: 'var(--erp-success)', marginBottom: '16px' }}></i>
          <h2>Application Filled</h2>
          <p>Your application data is saved as a Draft.</p>
          <button className="erp-btn erp-btn--primary" onClick={() => navigate('/documents')}>Proceed to Documents</button>
        </div>
      </main>
    );
  }

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.applicant.full_name) newErrors.full_name = "Full Name is required";
      if (!formData.applicant.dob) newErrors.dob = "Date of Birth is required";
      if (!formData.applicant.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.applicant.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.applicant.mobile_number) {
        newErrors.mobile_number = "Mobile number is required";
      } else if (!/^\d{10}$/.test(formData.applicant.mobile_number)) {
        newErrors.mobile_number = "Mobile must be exactly 10 digits";
      }
      if (!formData.applicant.adhar_number) {
        newErrors.adhar_number = "Aadhaar number is required";
      } else if (!/^\d{12}$/.test(formData.applicant.adhar_number)) {
        newErrors.adhar_number = "Aadhaar must be exactly 12 numeric digits";
      }
      if (!formData.applicant.religion) newErrors.religion = "Religion is required";
    }
    
    if (currentStep === 2) {
      const fields = ['perm_area', 'perm_city', 'perm_state', 'perm_district', 'perm_taluka', 'perm_pin'];
      fields.forEach(f => {
        if (!formData.applicant[f]) newErrors[f] = "Required";
      });
    }

    if (currentStep === 3) {
      if (!formData.parent_details.name) newErrors.parent_name = "Guardian name is required";
      if (!formData.parent_details.mobile_number) newErrors.parent_mobile = "Parent mobile is required";
      if (formData.parent_details.annual_income === '') newErrors.annual_income = "Mandatory";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1);
    } else {
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show('Please fix the highlighted errors before proceeding.', 'danger');
      }
    }
  };
  
  const handleBack = () => {
    setErrors({});
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setLoading(true);
    
    try {
      const payload = {
        user_id: global.userId,
        brochure_id: global.brochureId,
        course_name: global.courseName,
        admission_year: parseInt(formData.applicant.academic_year, 10) || new Date().getFullYear(),
        applicant: { ...formData.applicant },
        parent_details: { ...formData.parent_details },
        education: [...formData.education].map((edu) => ({
          ...edu,
          passout_year: parseInt(edu.passout_year, 10) || 0,
          total_marks: parseInt(edu.total_marks, 10) || 0,
          obtained_marks: parseInt(edu.obtained_marks, 10) || 0,
          attempt_count: parseInt(edu.attempt_count, 10) || 1,
        })),
      };

      payload.parent_details.annual_income = parseFloat(payload.parent_details.annual_income) || 0;
      
      let res;
      if (global.applicationId) {
        // If they already have an ID (i.e. Revision Required flow)
        res = await updateApplication(global.applicationId, payload);
      } else {
        res = await submitApplication(payload);
      }

      setGlobalState({
        applicationId: res.application_id,
        status: 'draft_application',
      });
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show('Application Saved! Proceed to Doc Upload.', 'success');
      }
      navigate('/documents');

    } catch (error) {
      setLoading(false);
      console.error(error);
      const detail = error.response?.data?.detail || error.message || '';
      
      if (detail.includes("Aadhaar Number already registered") || detail.includes("unique constraint") && detail.includes("adhar_number")) {
        setShowDuplicatePrompt(true);
      } else {
        if (window.ERP && window.ERP.Toast) {
          window.ERP.Toast.show(detail || 'Error saving application.', 'danger');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    updateApplicant({
      temp_area: formData.applicant.perm_area,
      temp_city: formData.applicant.perm_city,
      temp_state: formData.applicant.perm_state,
      temp_district: formData.applicant.perm_district,
      temp_taluka: formData.applicant.perm_taluka,
      temp_pin: formData.applicant.perm_pin,
    });
  };

  return (
    <main className="erp-main" data-erp-page="Applicant / Application">
      <div className="erp-page-header">
        <h1>Admission Application ({global.courseName})</h1>
        <p>Step {step} of 4</p>
      </div>
      
      {/* Iconic Tab Stepper Visuals */}
      <div className="erp-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {[
            { s: 1, icon: 'fa-solid fa-user', label: 'Personal' },
            { s: 2, icon: 'fa-solid fa-location-dot', label: 'Address' },
            { s: 3, icon: 'fa-solid fa-users', label: 'Guardian' },
            { s: 4, icon: 'fa-solid fa-graduation-cap', label: 'Education' }
          ].map((tab, idx) => {
            const isActive = tab.s === step;
            const isCompleted = tab.s < step;
            
            let color = 'var(--erp-text-muted)';
            let bg = 'transparent';
            if (isActive) {
              color = 'var(--erp-primary)';
              bg = '#e0e7ff';
            } else if (isCompleted) {
              color = 'var(--erp-success)';
              bg = '#dcfce7';
            }

            return (
              <React.Fragment key={tab.s}>
                {idx > 0 && (
                  <div style={{ flex: 1, height: '2px', background: isCompleted || isActive ? 'var(--erp-primary)' : 'var(--erp-border)', margin: '0 16px', opacity: 0.5 }}></div>
                )}
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '24px',
                  background: bg, color: color, fontWeight: isActive ? 'bold' : 'normal', transition: 'all 0.3s ease'
                }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none', color: color
                  }}>
                    <i className={isCompleted && !isActive ? 'fa-solid fa-check' : tab.icon}></i>
                  </div>
                  <span style={{ fontSize: '15px' }}>{tab.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="erp-card">
        <div className="erp-card__header">
          <div className="erp-card__title">
            {step === 1 && "Personal & Demographic Information"}
            {step === 2 && "Address Information"}
            {step === 3 && "Parent & Guardian Details"}
            {step === 4 && "Previous Education Details"}
          </div>
        </div>
        <div className="erp-card__body">
          {global.status === 'revision_required' && (
            <div className="erp-alert erp-alert--warning" style={{ marginBottom: '24px' }}>
              <strong><i className="fa-solid fa-triangle-exclamation"></i> Action Required:</strong> The administrative team has requested changes to your application. Please fix the highlighted fields and submit again.
            </div>
          )}
          {isReadOnly && (
            <div className="erp-alert erp-alert--primary" style={{ marginBottom: '24px' }}>
              <strong><i className="fa-solid fa-lock"></i> Read-Only View:</strong> Your application is currently locked and cannot be edited.
            </div>
          )}

          <form onSubmit={step === 4 ? handleSubmit : handleNext}>
            <fieldset disabled={isReadOnly} style={{ border: 'none', padding: 0, margin: 0 }}>

            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="erp-form-grid-3">
                <div className="erp-form-group">
                  <label>Full Name *</label>
                  <input className={`erp-form-control ${errors.full_name ? 'is-invalid' : ''}`} type="text" value={formData.applicant.full_name} onChange={e => updateApplicant({full_name: e.target.value})} required />
                  {errors.full_name && <div className="erp-error-hint">{errors.full_name}</div>}
                </div>
                <div className="erp-form-group">
                  <label>Date of Birth *</label>
                  <input className={`erp-form-control ${errors.dob ? 'is-invalid' : ''}`} type="date" value={formData.applicant.dob} onChange={e => updateApplicant({dob: e.target.value})} required />
                  {errors.dob && <div className="erp-error-hint">{errors.dob}</div>}
                </div>
                <div className="erp-form-group">
                  <label>Birth Place</label>
                  <input className="erp-form-control" type="text" value={formData.applicant.birth_place} onChange={e => updateApplicant({birth_place: e.target.value})} />
                </div>
                <div className="erp-form-group">
                  <label>Gender *</label>
                  <select className="erp-form-control" value={formData.applicant.gender} onChange={e => updateApplicant({gender: e.target.value})}>
                     <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>Blood Group</label>
                  <input className="erp-form-control" type="text" value={formData.applicant.blood_group} onChange={e => updateApplicant({blood_group: e.target.value})} />
                </div>
                <div className="erp-form-group">
                  <label>Marital Status</label>
                  <select className="erp-form-control" value={formData.applicant.marital_status} onChange={e => updateApplicant({marital_status: e.target.value})}>
                     <option>Single</option><option>Married</option><option>Divorced</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>ABC ID</label>
                  <input className="erp-form-control" type="text" value={formData.applicant.abc_id} onChange={e => updateApplicant({abc_id: e.target.value})} />
                </div>
                <div className="erp-form-group">
                  <label>Aadhar Number (12 Digits) *</label>
                  <input className={`erp-form-control ${errors.adhar_number ? 'is-invalid' : ''}`} type="text" value={formData.applicant.adhar_number} onChange={e => updateApplicant({adhar_number: e.target.value})} />
                  {errors.adhar_number && <div className="erp-error-hint">{errors.adhar_number}</div>}
                </div>
                <div className="erp-form-group">
                  <label>Nationality</label>
                  <input className="erp-form-control" type="text" value={formData.applicant.nationality} onChange={e => updateApplicant({nationality: e.target.value})} />
                </div>
                <div className="erp-form-group">
                  <label>Email *</label>
                  <input className={`erp-form-control ${errors.email ? 'is-invalid' : ''}`} type="email" value={formData.applicant.email} onChange={e => updateApplicant({email: e.target.value})} required />
                  {errors.email && <div className="erp-error-hint">{errors.email}</div>}
                </div>
                <div className="erp-form-group">
                  <label>Mobile *</label>
                  <input className={`erp-form-control ${errors.mobile_number ? 'is-invalid' : ''}`} type="tel" value={formData.applicant.mobile_number} onChange={e => updateApplicant({mobile_number: e.target.value})} required />
                  {errors.mobile_number && <div className="erp-error-hint">{errors.mobile_number}</div>}
                </div>
                <div className="erp-form-group">
                  <label>Religion *</label>
                  <input className={`erp-form-control ${errors.religion ? 'is-invalid' : ''}`} type="text" value={formData.applicant.religion} onChange={e => updateApplicant({religion: e.target.value})} required />
                  {errors.religion && <div className="erp-error-hint">{errors.religion}</div>}
                </div>
                <div className="erp-form-group">
                  <label>Caste Category *</label>
                  <select className="erp-form-control" value={formData.applicant.caste_category} onChange={e => updateApplicant({caste_category: e.target.value})}>
                     <option>Open</option><option>OBC</option><option>SC</option><option>ST</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>Disabled / Handicap?</label>
                  <select className="erp-form-control" value={formData.applicant.is_disable_handicap} onChange={e => updateApplicant({is_disable_handicap: e.target.value})}>
                     <option>No</option><option>Yes</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>Residence Type *</label>
                  <select className="erp-form-control" value={formData.applicant.hosteller_or_day_scholar} onChange={e => updateApplicant({hosteller_or_day_scholar: e.target.value})}>
                     <option>Day Scholar</option><option>Hosteller</option>
                  </select>
                </div>
                <div className="erp-form-group">
                  <label>Scholarship Student?</label>
                  <select className="erp-form-control" value={formData.applicant.is_scholarship_student} onChange={e => updateApplicant({is_scholarship_student: e.target.value})}>
                     <option>No</option><option>Yes</option>
                  </select>
                </div>
                <div className="erp-form-group"><label>Mother Tongue</label><input className="erp-form-control" type="text" value={formData.applicant.mother_tongue} onChange={e => updateApplicant({mother_tongue: e.target.value})} /></div>
                <div className="erp-form-group">
                  <label>Minority?</label>
                  <select className="erp-form-control" value={formData.applicant.minority} onChange={e => updateApplicant({minority: e.target.value})}>
                     <option>No</option><option>Yes</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: Address */}
            {step === 2 && (
              <>
                <h4 style={{marginBottom: 16}}>Permanent Address</h4>
                <div className="erp-form-grid-3">
                  <div className="erp-form-group"><label>Area</label><input className="erp-form-control" value={formData.applicant.perm_area} onChange={e=>updateApplicant({perm_area: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>City</label><input className="erp-form-control" value={formData.applicant.perm_city} onChange={e=>updateApplicant({perm_city: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>State</label><input className="erp-form-control" value={formData.applicant.perm_state} onChange={e=>updateApplicant({perm_state: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>District</label><input className="erp-form-control" value={formData.applicant.perm_district} onChange={e=>updateApplicant({perm_district: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Taluka</label><input className="erp-form-control" value={formData.applicant.perm_taluka} onChange={e=>updateApplicant({perm_taluka: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Pin Code</label><input className="erp-form-control" value={formData.applicant.perm_pin} onChange={e=>updateApplicant({perm_pin: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Country</label><input className="erp-form-control" value={formData.applicant.perm_country} onChange={e=>updateApplicant({perm_country: e.target.value})} required/></div>
                </div>

                <div style={{marginTop: 32, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16}}>
                    <h4 style={{margin: 0}}>Temporary Address</h4>
                    <button type="button" className="erp-btn erp-btn--outline" onClick={copyAddress} style={{padding: '4px 8px', fontSize: '12px'}}>Copy Permanent</button>
                </div>
                <div className="erp-form-grid-3">
                  <div className="erp-form-group"><label>Area</label><input className="erp-form-control" value={formData.applicant.temp_area} onChange={e=>updateApplicant({temp_area: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>City</label><input className="erp-form-control" value={formData.applicant.temp_city} onChange={e=>updateApplicant({temp_city: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>State</label><input className="erp-form-control" value={formData.applicant.temp_state} onChange={e=>updateApplicant({temp_state: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>District</label><input className="erp-form-control" value={formData.applicant.temp_district} onChange={e=>updateApplicant({temp_district: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Taluka</label><input className="erp-form-control" value={formData.applicant.temp_taluka} onChange={e=>updateApplicant({temp_taluka: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Pin Code</label><input className="erp-form-control" value={formData.applicant.temp_pin} onChange={e=>updateApplicant({temp_pin: e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Country</label><input className="erp-form-control" value={formData.applicant.temp_country} onChange={e=>updateApplicant({temp_country: e.target.value})} required/></div>
                </div>
              </>
            )}

            {/* STEP 3: Parent Info */}
            {step === 3 && (
              <>
                <div className="erp-form-grid-3">
                  <div className="erp-form-group">
                     <label>Primary Guardian *</label>
                     <select className="erp-form-control" value={formData.parent_details.parent_relationship} onChange={e=>updateParent({parent_relationship: e.target.value})}>
                        <option>Father</option><option>Mother</option><option>Guardian</option>
                     </select>
                  </div>
                  <div className="erp-form-group"><label>Guardian Name *</label><input className="erp-form-control" value={formData.parent_details.name} onChange={e=>updateParent({name:e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Mother's Name *</label><input className="erp-form-control" value={formData.parent_details.mother_name} onChange={e=>updateParent({mother_name:e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Parent Mobile *</label><input className="erp-form-control" value={formData.parent_details.mobile_number} onChange={e=>updateParent({mobile_number:e.target.value})} required/></div>
                  <div className="erp-form-group"><label>Parent Email</label><input className="erp-form-control" type="email" value={formData.parent_details.email} onChange={e=>updateParent({email:e.target.value})} /></div>
                  <div className="erp-form-group"><label>Occupation</label><input className="erp-form-control" value={formData.parent_details.occupation} onChange={e=>updateParent({occupation:e.target.value})}/></div>
                  <div className="erp-form-group"><label>Annual Income (₹) *</label><input type="number" className="erp-form-control" value={formData.parent_details.annual_income} onChange={e=>updateParent({annual_income:e.target.value})} required/></div>
                </div>
                
                <h4 style={{marginTop: 32, marginBottom: 16}}>Guardian Details (Optional)</h4>
                <div className="erp-form-grid-3">
                  <div className="erp-form-group"><label>Guardian Name</label><input className="erp-form-control" value={formData.parent_details.guardian_name} onChange={e=>updateParent({guardian_name:e.target.value})} /></div>
                  <div className="erp-form-group"><label>Guardian Occupation</label><input className="erp-form-control" value={formData.parent_details.guardian_occupation} onChange={e=>updateParent({guardian_occupation:e.target.value})} /></div>
                  <div className="erp-form-group"><label>Guardian Mobile</label><input className="erp-form-control" value={formData.parent_details.guardian_mobile} onChange={e=>updateParent({guardian_mobile:e.target.value})} /></div>
                  <div className="erp-form-group"><label>Guardian Email</label><input className="erp-form-control" type="email" value={formData.parent_details.guardian_email} onChange={e=>updateParent({guardian_email:e.target.value})} /></div>
                </div>
              </>
            )}

            {/* STEP 4: Education */}
            {step === 4 && (
              <>
                 {formData.education.map((edu, idx) => (
                    <div key={idx} style={{marginBottom: 24, padding: 16, border: '1px solid var(--erp-border)', borderRadius: 8, position: 'relative'}}>
                       {idx > 0 && <button type="button" onClick={() => removeEducation(idx)} style={{position: 'absolute', top: 16, right: 16, color: 'var(--erp-danger)', border: 'none', background: 'none', cursor: 'pointer'}}><i className="fa-solid fa-trash"></i></button>}
                       <h4 style={{marginBottom: 16}}>Academic Record {idx + 1}</h4>
                       
                       <div className="erp-form-grid-3">
                          <div className="erp-form-group">
                            <label>Qualification Level *</label>
                            <input className="erp-form-control" value={edu.last_qualification_level} onChange={e => updateEducation(idx, {last_qualification_level: e.target.value})} placeholder="e.g. 10th, 12th, B.Sc" required />
                          </div>
                          <div className="erp-form-group">
                            <label>Board / University *</label>
                            <input className="erp-form-control" value={edu.university_board} onChange={e => updateEducation(idx, {university_board: e.target.value})} required />
                          </div>
                          <div className="erp-form-group">
                            <label>School / College Name *</label>
                            <input className="erp-form-control" value={edu.last_institution_college_name} onChange={e => updateEducation(idx, {last_institution_college_name: e.target.value})} required />
                          </div>
                          <div className="erp-form-group">
                            <label>Passing Year *</label>
                            <input className="erp-form-control" type="number" value={edu.passout_year} onChange={e => updateEducation(idx, {passout_year: e.target.value})} required />
                          </div>
                          <div className="erp-form-group">
                            <label>Total Marks</label>
                            <input className="erp-form-control" type="number" value={edu.total_marks} onChange={e => {
                              const total = parseFloat(e.target.value) || 0;
                              const obtained = parseFloat(edu.obtained_marks) || 0;
                              const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : null;
                              updateEducation(idx, {total_marks: e.target.value, percentage: percentage ? parseFloat(percentage) : null});
                            }} />
                          </div>
                          <div className="erp-form-group">
                            <label>Obtained Marks</label>
                            <input className="erp-form-control" type="number" value={edu.obtained_marks} onChange={e => {
                              const obtained = parseFloat(e.target.value) || 0;
                              const total = parseFloat(edu.total_marks) || 0;
                              const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : null;
                              updateEducation(idx, {obtained_marks: e.target.value, percentage: percentage ? parseFloat(percentage) : null});
                            }} />
                          </div>
                          <div className="erp-form-group"><label>Passing Month</label><input className="erp-form-control" type="text" value={edu.passing_month} onChange={e => updateEducation(idx, {passing_month: e.target.value})} /></div>
                          <div className="erp-form-group"><label>Seat Number</label><input className="erp-form-control" type="text" value={edu.last_exam_seat_no} onChange={e => updateEducation(idx, {last_exam_seat_no: e.target.value})} /></div>
                          <div className="erp-form-group"><label>Percentage (Auto)</label><input className="erp-form-control" type="number" step="0.01" value={edu.percentage || ''} readOnly style={{backgroundColor: 'var(--erp-bg)'}} /></div>
                          <div className="erp-form-group"><label>Batch Year</label><input className="erp-form-control" type="text" value={edu.batch_year} onChange={e => updateEducation(idx, {batch_year: e.target.value})} /></div>
                          <div className="erp-form-group"><label>Stream</label><input className="erp-form-control" type="text" value={edu.stream} onChange={e => updateEducation(idx, {stream: e.target.value})} /></div>
                          <div className="erp-form-group"><label>Grade / Class</label><input className="erp-form-control" type="text" value={edu.grade} onChange={e => updateEducation(idx, {grade: e.target.value})} /></div>
                          <div className="erp-form-group">
                            <label>Attempt Count</label>
                            <input className="erp-form-control" type="number" value={edu.attempt_count} onChange={e => updateEducation(idx, {attempt_count: e.target.value})} />
                          </div>
                          <div className="erp-form-group">
                            <label>Gap In Education?</label>
                            <select className="erp-form-control" value={edu.gap_in_education} onChange={e => updateEducation(idx, {gap_in_education: e.target.value})}>
                              <option>No</option><option>Yes</option>
                            </select>
                          </div>
                          <div className="erp-form-group" style={{ gridColumn: 'span 2' }}><label>Exam Center Code</label><input className="erp-form-control" type="text" value={edu.exam_center_code} onChange={e => updateEducation(idx, {exam_center_code: e.target.value})} /></div>
                       </div>
                    </div>
                 ))}

                 <button type="button" className="erp-btn erp-btn--outline" onClick={addEducation}>
                    <i className="fa-solid fa-plus"></i> Add Another Qualification
                 </button>
              </>
            )}

             <hr style={{margin: '24px 0', border: 'none', borderTop: '1px solid var(--erp-border)'}}/>
            
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
               <button type="button" className="erp-btn erp-btn--outline" onClick={handleBack} disabled={step === 1}>Back</button>
               {isReadOnly ? (
                 <button type="button" className="erp-btn erp-btn--primary" onClick={handleNext} disabled={step === 4}>Next Page</button>
               ) : (
                 <button type="submit" className="erp-btn erp-btn--primary" disabled={loading}>
                   {step < 4 ? 'Next Step' : (loading ? 'Saving...' : 'Next: Document Upload')}
                 </button>
               )}
            </div>
            </fieldset>
          </form>
        </div>
      </div>
      
      {/* Duplicate Aadhaar Prompt */}
      {showDuplicatePrompt && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="erp-card" style={{ maxWidth: '450px', width: '90%', textAlign: 'center', borderRadius: '16px', borderTop: '6px solid var(--erp-danger)' }}>
            <div className="erp-card__body" style={{ padding: '32px' }}>
              <i className="fa-solid fa-id-card-clip" style={{ fontSize: '48px', color: 'var(--erp-danger)', marginBottom: '20px' }}></i>
              <h3>Application Already Exists</h3>
              <p style={{ color: 'var(--erp-text-muted)', marginBottom: '24px' }}>An application has already been registered with this Aadhaar Number. You cannot create multiple applications with the same Aadhaar.</p>
              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <button className="erp-btn erp-btn--primary" onClick={() => navigate('/status')}>Track Existing Application</button>
                <button className="erp-btn erp-btn--outline" onClick={() => setShowDuplicatePrompt(false)}>Change Aadhaar Number</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
