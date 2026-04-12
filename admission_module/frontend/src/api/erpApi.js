import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'http://localhost:5173/login';
    }
    return Promise.reject(error);
  }
);

const handleError = (error) => {
  console.error('[erpApi Error]', error);
  const response = error?.response?.data;
  
  // FastAPI often puts specific validation errors in 'detail'
  let message = 'API Connection Error';
  
  if (response) {
    if (typeof response.detail === 'string') {
      message = response.detail;
    } else if (Array.isArray(response.detail)) {
      // Handle Pydantic validation errors (array of objects)
      message = response.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(' | ');
    } else {
      message = response.message || error.message || 'Unknown API error';
    }
  } else if (error.request) {
    message = 'Server not responding. Please check if the Admission Backend (8001) is running.';
  } else {
    message = error.message;
  }
  
  throw new Error(message);
};

export const requestBrochure = async ({ userId, courseName }) => {
  try {
    const { data } = await api.post('/api/v1/brochures/request', { user_id: userId, course_name: courseName });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const payBrochure = async ({ brochureId, amount = 200.0, paymentMethod = 'credit_card' }) => {
  try {
    const { data } = await api.post('/api/v1/brochures/pay', {
      brochure_id: brochureId,
      amount,
      payment_method: paymentMethod,
      transaction_id: `txn_${Date.now()}`,
    });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const submitApplication = async (payload) => {
  try {
    const { data } = await api.post('/api/v1/applications/submit', payload);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const updateApplication = async (applicationId, payload) => {
  try {
    const { data } = await api.put(`/api/v1/applications/${applicationId}/update`, payload);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const finalizeApplication = async ({ applicationId, userId }) => {
  try {
    const { data } = await api.post(`/api/v1/applications/${applicationId}/finalize`, null, {
      params: { user_id: userId },
    });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const getApplicationStatusTracking = async (applicationId) => {
  try {
    const { data } = await api.get(`/api/v1/applications/${applicationId}/status`);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const uploadDocument = async (formData) => {
  try {
    const { data } = await api.post('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const getUploadedDocuments = async (applicationId) => {
  try {
    const { data } = await api.get(`/api/v1/documents/application/${applicationId}`);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const payAdmissionFee = async ({ applicationId, amount }) => {
  try {
    const { data } = await api.post('/api/v1/payments/admission-fee', { application_id: applicationId, amount });
    return data;
  } catch (error) {
    handleError(error);
  }
};

// --- Admin Endpoints ---

export const getApplications = async () => {
  try {
    const { data } = await api.get('/api/v1/admin/applications');
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const getApplicationDetails = async (applicationId) => {
  try {
    const { data } = await api.get(`/api/v1/admin/applications/${applicationId}`);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const submitReview = async (reviewPayload) => {
  try {
    const { data } = await api.post('/api/v1/admin/review', reviewPayload);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const verifyDocument = async (verifyPayload) => {
  try {
    const { data } = await api.post('/api/v1/admin/document/verify', verifyPayload);
    return data;
  } catch (error) {
    handleError(error);
  }
};

export default api;
