import API from './api';

export const patientService = {
  getAll: async () => {
    const res = await API.get('/patients');
    return res.data;
  },
  
  getById: async (id) => {
    const res = await API.get(`/patients/${id}`);
    return res.data;
  },
  
  create: async (data) => {
    const res = await API.post('/admin/patients', data);
    return res.data;
  },
  
  update: async (id, data) => {
    const res = await API.put(`/admin/patients/${id}`, data);
    return res.data;
  },
  
  delete: async (id) => {
    const res = await API.delete(`/admin/patients/${id}`);
    return res.data;
  }
};
