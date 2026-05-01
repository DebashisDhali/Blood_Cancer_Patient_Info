import API from './api';

export const documentService = {
  getByPatientId: async (patientId) => {
    const res = await API.get(`/documents/patient/${patientId}`);
    return res.data;
  },
  
  upload: async (formData) => {
    const res = await API.post('/admin/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  
  delete: async (id) => {
    const res = await API.delete(`/admin/documents/${id}`);
    return res.data;
  }
};
