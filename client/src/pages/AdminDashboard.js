import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import cacheStore from '../services/cacheStore';
import '../styles/AdminDashboard.css';

const EMPTY_FORM = {
  name: '', age: '', gender: 'male', blood_type: '', cancer_type: '', phone: '', email: '', address: '',
  doctor_name: '', hospital: '', status: 'in-treatment', admission_date: '',
  chemo_total: '', chemo_completed: '',
  target_amount: '', collected_amount: 0, fund_description: '',
  dept: '', batch: '', session: '', payment_holder_info: '',
  bank_name: '', bank_account_name: '', bank_account_no: '', bank_branch: '',
  bkash_no: '', nagad_no: '', rocket_no: '', upay_no: ''
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [bankQrFile, setBankQrFile] = useState(null);
  const [bankQrPreview, setBankQrPreview] = useState(null);
  const [bkashQrFile, setBkashQrFile] = useState(null);
  const [bkashQrPreview, setBkashQrPreview] = useState(null);
  const [nagadQrFile, setNagadQrFile] = useState(null);
  const [nagadQrPreview, setNagadQrPreview] = useState(null);
  const [sidFile, setSidFile] = useState(null);
  const [sidPreview, setSidPreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('patients');
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bankQrRef = useRef(null);
  const bkashQrRef = useRef(null);
  const nagadQrRef = useRef(null);
  const sidInputRef = useRef(null);

  const DASH_CACHE_TTL = 3 * 60 * 1000; 

  const fetchAdminsBackground = async () => {
    if (!token || user?.role !== 'super_admin') return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/admins`, { headers: { Authorization: `Bearer ${token}` } });
      cacheStore.set('admin:admins', res.data, DASH_CACHE_TTL);
      setAdminsList(res.data);
    } catch (err) {
      console.error('Background fetch admins failed:', err);
    }
  };

  const fetchData = useCallback(async ({ forceRefresh = false } = {}) => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const cacheKeyStats    = `admin:stats:${user?.role}`;
    const cacheKeyPatients = `admin:patients:${user?.role}`;
    const cacheKeyAdmins   = 'admin:admins';

    const cachedStats    = !forceRefresh && cacheStore.get(cacheKeyStats);
    const cachedPatients = !forceRefresh && cacheStore.get(cacheKeyPatients);
    const cachedAdmins   = !forceRefresh && user?.role === 'super_admin' && cacheStore.get(cacheKeyAdmins);

    if (cachedStats && cachedPatients) {
      setStats(cachedStats);
      setPatients(cachedPatients);
      if (cachedAdmins) setAdminsList(cachedAdmins);
      setLoading(false);
      setAdminsLoading(false);

      const isStale = cacheStore.isStale(cacheKeyStats) || cacheStore.isStale(cacheKeyPatients);
      if (!isStale) return; 

      Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/patients/all`, { headers }),
        ...(user?.role === 'super_admin'
          ? [axios.get(`${process.env.REACT_APP_API_URL}/admin/admins`, { headers })]
          : [])
      ]).then(results => {
        const freshStats    = results[0].data;
        const freshPatients = results[1].data;
        const freshAdmins   = results[2]?.data;

        if (JSON.stringify(freshStats) !== JSON.stringify(cachedStats)) {
          cacheStore.set(cacheKeyStats, freshStats, DASH_CACHE_TTL);
          setStats(freshStats);
        }
        if (JSON.stringify(freshPatients) !== JSON.stringify(cachedPatients)) {
          cacheStore.set(cacheKeyPatients, freshPatients, DASH_CACHE_TTL);
          setPatients(freshPatients);
        }
        if (freshAdmins && JSON.stringify(freshAdmins) !== JSON.stringify(cachedAdmins)) {
          cacheStore.set(cacheKeyAdmins, freshAdmins, DASH_CACHE_TTL);
          setAdminsList(freshAdmins);
        }
      }).catch(err => {
        if (err.response?.status === 401) navigate('/login');
      });
      return;
    }

    try {
      const requests = [
        axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/patients/all`, { headers })
      ];
      if (user?.role === 'super_admin') {
        requests.push(axios.get(`${process.env.REACT_APP_API_URL}/admin/admins`, { headers }));
      }
      const results = await Promise.all(requests);

      cacheStore.set(cacheKeyStats,    results[0].data, DASH_CACHE_TTL);
      cacheStore.set(cacheKeyPatients, results[1].data, DASH_CACHE_TTL);
      setStats(results[0].data);
      setPatients(results[1].data);

      if (user?.role === 'super_admin' && results[2]) {
        cacheStore.set(cacheKeyAdmins, results[2].data, DASH_CACHE_TTL);
        setAdminsList(results[2].data);
      }
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
      setAdminsLoading(false);
    }
  }, [token, navigate, user?.role]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, [token, navigate, fetchData]);

  const compressImage = (file, maxWidth = 1000, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve({ preview: dataUrl, base64: dataUrl.split(',')[1] });
        };
      };
    });
  };

  const handleFile = async (e, setP, setF) => {
    const file = e.target.files[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setP(localPreview);
    const compressed = await compressImage(file);
    setP(compressed.preview);
    setF(compressed.base64);
  };

  const openAdd = () => { 
    setEditPatient(null); 
    setForm(EMPTY_FORM); 
    setPhotoPreview(null); 
    setPhotoFile(null);
    setBankQrPreview(null); setBankQrFile(null);
    setBkashQrPreview(null); setBkashQrFile(null);
    setNagadQrPreview(null); setNagadQrFile(null);
    setSidPreview(null);
    setSidFile(null);
    setFormMsg(null); 
    setShowForm(true); 
  };

  const [donationLogs, setDonationLogs] = useState([]);
  const [logForm, setLogForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });

  const fetchLogs = async (fundId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/donations/fund/${fundId}`);
      setDonationLogs(res.data);
    } catch (e) { console.error(e); }
  };

  const handleAddLog = async () => {
    if (!logForm.amount || !editPatient?.fund?.id) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/donations`, {
        fund_id: editPatient.fund.id,
        amount: Number(logForm.amount),
        date: logForm.date,
        note: logForm.note
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setForm(prev => ({ 
        ...prev, 
        collected_amount: Number(prev.collected_amount || 0) + Number(logForm.amount) 
      }));
      
      setLogForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
      fetchLogs(editPatient.fund.id);
      cacheStore.invalidate('admin:');
      fetchData({ forceRefresh: true });
    } catch (e) { alert('Failed to add log'); }
  };

  const handleDeleteLog = async (logId, amount) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/donations/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm(prev => ({ 
        ...prev, 
        collected_amount: Math.max(0, Number(prev.collected_amount || 0) - Number(amount)) 
      }));
      fetchLogs(editPatient.fund.id);
      cacheStore.invalidate('admin:');
      fetchData({ forceRefresh: true });
    } catch (e) { alert('Delete failed'); }
  };

  const [docs, setDocs] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]);
  const [docForm, setDocForm] = useState({ title: '', type: 'report', file: null });

  const fetchDocs = async (pid) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/documents/patient/${pid}`);
      setDocs(res.data);
    } catch (e) { console.error(e); }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const docData = { title: docForm.title || file.name, document_type: docForm.type, file: base64 };
      if (editPatient) {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/documents/${editPatient.id}`, docData, { headers: { Authorization: `Bearer ${token}` } });
          setDocForm({ title: '', type: 'report', file: null });
          fetchDocs(editPatient.id);
        } catch (err) { alert('Upload failed'); }
      } else {
        setPendingDocs([...pendingDocs, docData]);
        setDocForm({ title: '', type: 'report', file: null });
      }
    };
  };

  const deleteDoc = async (id) => {
    if (!window.confirm("Delete document?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/documents/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchDocs(editPatient.id);
    } catch (e) { alert('Delete failed'); }
  };

  const openEdit = (p) => {
    setEditPatient(p);
    setForm({
      ...EMPTY_FORM,
      ...p,
      target_amount: p.fund?.target_amount || '',
      collected_amount: p.fund?.collected_amount || 0,
      fund_description: p.fund?.description || '',
      payment_holder_info: p.fund?.payment_holder_info || '',
      bank_name: p.fund?.bank_name || '', 
      bank_account_name: p.fund?.bank_account_name || '',
      bank_account_no: p.fund?.bank_account_no || '', 
      bank_branch: p.fund?.bank_branch || '',
      bkash_no: p.fund?.bkash_no || '', 
      nagad_no: p.fund?.nagad_no || '',
      rocket_no: p.fund?.rocket_no || '', 
      upay_no: p.fund?.upay_no || ''
    });
    setPhotoPreview(p.photo_url);
    setBankQrPreview(p.fund?.bank_qr_url);
    setBkashQrPreview(p.fund?.bkash_qr_url);
    setNagadQrPreview(p.fund?.nagad_qr_url);
    setSidPreview(p.student_id_url);
    if (p.fund?.id) fetchLogs(p.fund.id);
    fetchDocs(p.id);
    setFormMsg(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg(null);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const patientData = {
        name: form.name, age: form.age, gender: form.gender, blood_type: form.blood_type,
        cancer_type: form.cancer_type, phone: form.phone, email: form.email, address: form.address,
        doctor_name: form.doctor_name, hospital: form.hospital, status: form.status,
        admission_date: form.admission_date, chemo_total: form.chemo_total, chemo_completed: form.chemo_completed,
        dept: form.dept, batch: form.batch, session: form.session
      };
      const fundData = {
        target_amount: form.target_amount, collected_amount: form.collected_amount,
        description: form.fund_description, payment_holder_info: form.payment_holder_info,
        bank_name: form.bank_name, bank_account_name: form.bank_account_name,
        bank_account_no: form.bank_account_no, bank_branch: form.bank_branch,
        bkash_no: form.bkash_no, nagad_no: form.nagad_no,
        rocket_no: form.rocket_no, upay_no: form.upay_no
      };
      let pid;
      if (editPatient) { 
        await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editPatient.id}`, { ...patientData, fund: fundData }, { headers }); 
        pid = editPatient.id; 
      } else { 
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, { ...patientData, fund: fundData }, { headers }); 
        pid = res.data.id; 
      }
      const tasks = [];
      if (photoFile) tasks.push(axios.post(`${process.env.REACT_APP_API_URL}/patients/${pid}/photo`, { image: photoFile }, { headers }));
      if (bankQrFile) tasks.push(axios.post(`${process.env.REACT_APP_API_URL}/patients/${pid}/qr`, { image: bankQrFile, type: 'bank' }, { headers }));
      if (bkashQrFile) tasks.push(axios.post(`${process.env.REACT_APP_API_URL}/patients/${pid}/qr`, { image: bkashQrFile, type: 'bkash' }, { headers }));
      if (nagadQrFile) tasks.push(axios.post(`${process.env.REACT_APP_API_URL}/patients/${pid}/qr`, { image: nagadQrFile, type: 'nagad' }, { headers }));
      if (sidFile) tasks.push(axios.post(`${process.env.REACT_APP_API_URL}/patients/${pid}/student-id`, { image: sidFile }, { headers }));
      if (!editPatient && pendingDocs.length > 0) {
        for (const doc of pendingDocs) { tasks.push(axios.post(`${process.env.REACT_APP_API_URL}/documents/${pid}`, doc, { headers })); }
      }
      await Promise.all(tasks);
      setFormMsg({ type: 'success', text: '✅ Saved successfully!' });
      cacheStore.invalidate('patients');
      cacheStore.invalidate('admin:');
      await fetchData({ forceRefresh: true });
      setTimeout(() => setShowForm(false), 1000);
    } catch (err) { setFormMsg({ type: 'error', text: err.response?.data?.message || err.message }); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete patient "${name}"? This action cannot be undone.`)) return;
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/patients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      cacheStore.invalidate('patients');
      cacheStore.invalidate('admin:');
      await fetchData({ forceRefresh: true });
    } catch (error) { alert('Delete failed'); }
    finally { setLoading(false); }
  };

  const handleDeleteSelf = async () => {
    if (!window.confirm("Are you sure?")) return;
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) { alert('Deletion failed'); setLoading(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="dash-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-dash">
      <div className="dash-topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dash-subtitle">Welcome back, <strong>{user?.username || 'Admin'}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user?.role === 'super_admin' && (
            <div className="dash-tab-switcher">
              <button className={activeTab === 'patients' ? 'active' : ''} onClick={() => setActiveTab('patients')}>🧬 Patients</button>
              <button className={activeTab === 'admins' ? 'active' : ''} onClick={() => setActiveTab('admins')}>👥 Manage Admins</button>
            </div>
          )}
          <button className="btn-delete-self" onClick={handleDeleteSelf}>Delete My Account</button>
          {activeTab === 'patients' && <button className="btn-add-patient" onClick={openAdd}>+ Add Patient</button>}
        </div>
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card"><div className="dsc-icon">🧬</div><div><div className="dsc-value">{stats?.totalPatients || 0}</div><div className="dsc-label">Patients</div></div></div>
        <div className="dash-stat-card"><div className="dsc-icon">💰</div><div><div className="dsc-value">{stats?.activeFunds || 0}</div><div className="dsc-label">Active Funds</div></div></div>
        <div className="dash-stat-card"><div className="dsc-icon">৳</div><div><div className="dsc-value">৳{(stats?.totalCollected || 0).toLocaleString()}</div><div className="dsc-label">Total Raised</div></div></div>
      </div>

      {activeTab === 'admins' && user?.role === 'super_admin' && (
        <div className="dash-table-wrap">
          <h2>👥 Admin Management</h2>
          <div className="table-scroll">
            <table className="dash-table">
              <thead><tr><th>Admin</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {adminsList.map(admin => (
                  <tr key={admin.id}>
                    <td><strong>{admin.username}</strong></td>
                    <td>{admin.email}</td>
                    <td>{admin.is_verified ? '✅ Verified' : '⏳ Pending'}</td>
                    <td>
                      {admin.role !== 'super_admin' && (
                        <button onClick={() => removeAdmin(admin)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="dash-table-wrap">
          <h2>Patients List</h2>
          <div className="table-scroll">
            <table className="dash-table">
              <thead><tr><th>Patient</th><th>Cancer</th><th>Status</th><th>Chemo</th><th>Fund</th><th>Action</th></tr></thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.cancer_type}</td>
                    <td><span className={`tbl-badge ${p.status}`}>{p.status}</span></td>
                    <td>{p.chemo_completed}/{p.chemo_total}</td>
                    <td>{p.fund ? `৳${p.fund.collected_amount.toLocaleString()}` : 'No Fund'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-edit" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={e => e.stopPropagation()}>
            <div className="form-modal-header"><h3>{editPatient ? 'Edit Patient' : 'Add Patient'}</h3><button onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="patient-form">
              <div className="form-section-title">Profile</div>
              <div className="form-grid">
                <div className="form-field"><label>Name</label><input required value={form.name} onChange={e => f('name', e.target.value)} /></div>
                <div className="form-field"><label>Age</label><input type="number" value={form.age} onChange={e => f('age', e.target.value)} /></div>
                <div className="form-field"><label>Cancer Type</label><input value={form.cancer_type} onChange={e => f('cancer_type', e.target.value)} /></div>
              </div>
              <div className="form-section-title">Funding</div>
              <div className="form-grid">
                <div className="form-field"><label>Target (BDT)</label><input type="number" value={form.target_amount} onChange={e => f('target_amount', e.target.value)} /></div>
                <div className="form-field"><label>Collected (BDT)</label><input type="number" value={form.collected_amount} onChange={e => f('collected_amount', e.target.value)} /></div>
              </div>
              <div className="form-footer"><button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
