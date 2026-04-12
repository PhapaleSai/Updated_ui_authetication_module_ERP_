import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFormStore from '../store/useFormStore';
import { payAdmissionFee } from '../api/erpApi';

export default function FinalPayment() {
  const navigate = useNavigate();
  const { global } = useFormStore();
  const [amount, setAmount] = useState(15000);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!global.applicationId) return;

    setLoading(true);
    try {
      await payAdmissionFee({ applicationId: global.applicationId, amount });
      useFormStore.getState().setGlobalState({ status: 'enrolled' });
      setMessage('Final admission fee paid successfully. You are now officially enrolled! Visit your Dashboard to view your docket.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="erp-main" data-erp-page="Applicant / Admission Payment">
      <div className="erp-page-header">
        <h1>Final Admission Fee</h1>
        <p>Use this page to pay the final fee after your application has been reviewed and approved.</p>
      </div>

      <div className="erp-card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="erp-card__body">
          {global.applicationId ? (
            <form onSubmit={handlePay}>
              <div className="erp-form-group">
                <label>Application ID</label>
                <input className="erp-form-control" type="text" value={global.applicationId} disabled />
              </div>
              <div className="erp-form-group">
                <label>Amount (₹)</label>
                <input
                  className="erp-form-control"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="0"
                  required
                />
              </div>
              <button type="submit" className="erp-btn erp-btn--primary" disabled={loading}>
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </form>
          ) : (
            <div className="erp-alert erp-alert--primary">
              You must complete an application before paying the final admission fee.
            </div>
          )}

          {message && <div className="erp-alert erp-alert--warning" style={{ marginTop: 16 }}>{message}</div>}

          <button type="button" className="erp-btn erp-btn--outline" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Back to Dashboard</button>
        </div>
      </div>
    </main>
  );
}
