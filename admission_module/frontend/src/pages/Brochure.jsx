import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormStore from '../store/useFormStore';
import { payBrochure, requestBrochure } from '../api/erpApi';

export default function Brochure() {
  const navigate = useNavigate();
  const { global, setGlobalState } = useFormStore();
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  const handleRequestBrochure = async () => {
    setLoading(true);
    try {
      // Step 1: Request Brochure
      const reqRes = await requestBrochure({ userId: global.userId, courseName: selectedCourse });
      const newBrochureId = reqRes.brochure_id;

      setGlobalState({
        brochureId: newBrochureId,
        courseName: selectedCourse,
        status: 'pending_payment'
      });

      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show('Brochure requested successfully! Please pay fee.', 'success');
      }

    } catch (error) {
      console.error(error);
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show(error.message || 'Failed to request brochure.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 2: Pay Brochure Fee
      await payBrochure({ brochureId: global.brochureId, amount: 200.0, paymentMethod: 'credit_card' });

      setGlobalState({
        status: 'paid_brochure' // Unlock admission form
      });

      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show('Payment successful! Admission form unlocked.', 'success');
      }
      navigate('/apply');

    } catch (error) {
      console.error(error);
      if (window.ERP && window.ERP.Toast) {
        window.ERP.Toast.show('Payment failed.', 'danger');
      }
    } finally {
      setLoading(false);
    }
  };

  // If already paid, tell them they can proceed
  if (global.status !== 'pending_brochure' && global.status !== 'pending_payment') {
    return (
      <main className="erp-main" data-erp-page="Applicant / Brochure">
        <div className="erp-card" style={{ textAlign: 'center', padding: '40px' }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '48px', color: 'var(--erp-success)', marginBottom: '16px' }}></i>
          <h2>Brochure Unlocked</h2>
          <p>You have already purchased the brochure for {global.courseName}.</p>
          <button className="erp-btn erp-btn--primary" onClick={() => navigate('/apply')}>Go to Admission Form</button>
        </div>
      </main>
    );
  }

  return (
    <main className="erp-main" data-erp-page="Applicant / Brochure">
      <div className="erp-page-header">
        <h1>1. Select Course & Get Brochure</h1>
        <p>Choose the course you want to apply for and purchase the brochure to unlock the admission form.</p>
      </div>

      <div className="erp-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="erp-card__header">
          <div className="erp-card__title">Brochure Details</div>
        </div>
        <div className="erp-card__body">
          {global.status === 'pending_brochure' ? (
            <div>
              <div className="erp-form-group">
                <label>Select Course Module</label>
                <select 
                  className="erp-form-control" 
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="" disabled>Select Course</option>
                  <option value="B. Sc. (Cyber & Data Science)">B. Sc. (Cyber & Data Science)</option>
                  <option value="B. Sc. (Cyber Security)">B. Sc. (Cyber Security)</option>
                  <option value="B. Sc. (Animation)">B. Sc. (Animation)</option>
                  <option value="BBA (IB) International Business">BBA (IB) International Business</option>
                  <option value="M. Sc. (Computer Application)">M. Sc. (Computer Application)</option>
                  <option value="M. Sc. (Data Science)">M. Sc. (Data Science)</option>
                  <option value="M.Com.">M.Com.</option>
                </select>
              </div>
              <p style={{ margin: '16px 0', fontSize: '14px', color: 'var(--erp-text-muted)' }}>
                Brochure Fee: <strong>₹200</strong>
              </p>
              <button 
                className="erp-btn erp-btn--primary" 
                onClick={handleRequestBrochure}
                disabled={loading || !selectedCourse}
              >
                {loading ? 'Requesting...' : 'Request Brochure'}
              </button>
            </div>
          ) : (
            <div>
              <div className="erp-alert erp-alert--warning" style={{ marginBottom: '16px' }}>
                Brochure requested for <strong>{global.courseName}</strong>. Please complete the payment to proceed.
              </div>
              
              <div className="erp-payment-summary" style={{ background: 'var(--erp-bg-soft)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Brochure Fee</span>
                  <span>₹200.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total Amount</span>
                  <span>₹200.00</span>
                </div>
              </div>

              <button 
                className="erp-btn erp-btn--success" 
                style={{ width: '100%' }}
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay ₹200 Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
