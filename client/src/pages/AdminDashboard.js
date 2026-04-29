import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const EMPTY_FORM = {
  name: '', age: '', gender: 'male', blood_type: '', cancer_type: '',
  phone: '', email: '', address: '', doctor_name: '', hospital: '',
  status: 'in-treatment', admission_date: '', chemo_total: 0, chemo_completed: 0,
  target_amount: '', collected_amount: 0, fund_description: '',
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
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [statsRes, patientsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/patients/all`, { headers })
      ]);
      setStats(statsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, [token]);

  const handleFile = (e, setP, setF) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setP(reader.result); setF(reader.result.split(',')[1]); };
    reader.readAsDataURL(file);
  };

  const openAdd = () => { setEditPatient(null); setForm(EMPTY_FORM); setPhotoPreview(null); setQrPreview(null); setFormMsg(null); setShowForm(true); };

  const openEdit = (p) => {
    setEditPatient(p);
    setForm({
      ...EMPTY_FORM, ...p,
      target_amount: p.fund?.target_amount || '',
      collected_amount: p.fund?.collected_amount || 0,
      fund_description: p.fund?.description || '',
      bank_name: p.fund?.bank_name || '', bank_account_name: p.fund?.bank_account_name || '',
      bank_account_no: p.fund?.bank_account_no || '', bank_branch: p.fund?.bank_branch || '',
      bkash_no: p.fund?.bkash_no || '', nagad_no: p.fund?.nagad_no || '',
      rocket_no: p.fund?.rocket_no || '', upay_no: p.fund?.upay_no || ''
    });
    setPhotoPreview(p.photo_url);
    setQrPreview(p.fund?.qr_code_url);
    setFormMsg(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const pPayload = {
        name: form.name, age: Number(form.age), gender: form.gender, blood_type: form.blood_type,
        cancer_type: form.cancer_type, phone: form.phone, email: form.email, address: form.address,
        doctor_name: form.doctor_name, hospital: form.hospital, status: form.status,
        admission_date: form.admission_date, chemo_total: Number(form.chemo_total), chemo_completed: Number(form.chemo_completed)
      };

      let pid;
      if (editPatient) { await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editPatient.id}`, pPayload, { headers }); pid = editPatient.id; }
      else { const res = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, pPayload, { headers }); pid = res.data.id; }

      if (photoFile) await axios.post(`${process.env.REACT_APP_API_URL}/patients/${pid}/photo`, { photo: photoFile }, { headers });

      if (form.target_amount) {
        const fPayload = {
          patient_id: pid, target_amount: Number(form.target_amount), collected_amount: Number(form.collected_amount),
          description: form.fund_description, bank_name: form.bank_name, bank_account_name: form.bank_account_name,
          bank_account_no: form.bank_account_no, bank_branch: form.bank_branch,
          bkash_no: form.bkash_no, nagad_no: form.nagad_no, rocket_no: form.rocket_no, upay_no: form.upay_no
        };
        let fid;
        if (editPatient?.fund) { await axios.put(`${process.env.REACT_APP_API_URL}/funds/${editPatient.fund.id}`, fPayload, { headers }); fid = editPatient.fund.id; }
        else { const res = await axios.post(`${process.env.REACT_APP_API_URL}/funds`, fPayload, { headers }); fid = res.data.id; }
        
        if (qrFile) await axios.post(`${process.env.REACT_APP_API_URL}/funds/${fid}/qr`, { photo: qrFile }, { headers });
      }

      setFormMsg({ type: 'success', text: '✅ Saved successfully!' });
      await fetchData();
      setTimeout(() => setShowForm(false), 1000);
    } catch (err) { setFormMsg({ type: 'error', text: err.response?.data?.message || err.message }); }
    finally { setFormLoading(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="dash-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-dash">
      <div className="dash-topbar">
        <h1>Admin Dashboard</h1>
        <button className="btn-add-patient" onClick={openAdd}>+ Add Patient</button>
      </div>

      <div className="dash-stats">
        {[
          { label: 'Patients', value: stats?.totalPatients || 0, icon: '🧬' },
          { label: 'Active Funds', value: stats?.activeFunds || 0, icon: '💰' },
          { label: 'Total Raised', value: `৳${(stats?.totalCollected || 0).toLocaleString()}`, icon: '৳' }
        ].map((s, i) => (
          <div className="dash-stat-card" key={i}><div className="dsc-icon">{s.icon}</div><div><div className="dsc-value">{s.value}</div><div className="dsc-label">{s.label}</div></div></div>
        ))}
      </div>

      <div className="dash-table-wrap">
        <h2>Patients List</h2>
        <div className="table-scroll">
          <table className="dash-table">
            <thead><tr><th>Patient</th><th>Cancer</th><th>Status</th><th>Chemo</th><th>Fund</th><th>Action</th></tr></thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id}>
                  <td><div className="tbl-patient-cell">{p.photo_url ? <img src={p.photo_url} className="tbl-avatar" /> : <div className="tbl-avatar-placeholder">👤</div>}<div><div className="tbl-name">{p.name}</div><div className="tbl-age">{p.age} yrs</div></div></div></td>
                  <td>{p.cancer_type}</td>
                  <td><span className={`tbl-badge ${p.status === 'recovered' ? 'green' : p.status === 'critical' ? 'red' : 'purple'}`}>{p.status}</span></td>
                  <td>{p.chemo_completed}/{p.chemo_total}</td>
                  <td>{p.fund ? `${Math.min(100, (p.fund.collected_amount / p.fund.target_amount) * 100).toFixed(1)}%` : 'N/A'}</td>
                  <td><button className="btn-edit" onClick={() => openEdit(p)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={e => e.stopPropagation()}>
            <div className="form-modal-header"><h3>{editPatient ? 'Edit Patient' : 'Add Patient'}</h3><button onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="patient-form">
              <div className="form-section-title">Photo & Profile</div>
              <div className="photo-upload-section">
                <div className="photo-preview-wrap" onClick={() => fileInputRef.current.click()}>
                  {photoPreview ? <img src={photoPreview} className="photo-preview-img" /> : '📷'}
                </div>
                <input ref={fileInputRef} type="file" hidden onChange={e => handleFile(e, setPhotoPreview, setPhotoFile)} />
              </div>

              <div className="form-grid">
                <div className="form-field"><label>Name</label><input required value={form.name} onChange={e => f('name', e.target.value)} /></div>
                <div className="form-field"><label>Age</label><input type="number" value={form.age} onChange={e => f('age', e.target.value)} /></div>
                <div className="form-field"><label>Gender</label><select value={form.gender} onChange={e => f('gender', e.target.value)}><option value="male">Male</option><option value="female">Female</option></select></div>
                <div className="form-field"><label>Blood</label><input value={form.blood_type} onChange={e => f('blood_type', e.target.value)} /></div>
                <div className="form-field"><label>Cancer</label><input value={form.cancer_type} onChange={e => f('cancer_type', e.target.value)} /></div>
                <div className="form-field"><label>Status</label><select value={form.status} onChange={e => f('status', e.target.value)}><option value="in-treatment">In Treatment</option><option value="critical">Critical</option><option value="recovered">Recovered</option></select></div>
              </div>

              <div className="form-section-title">Medical Progress</div>
              <div className="form-grid">
                <div className="form-field"><label>Admission Date</label><input type="date" value={form.admission_date} onChange={e => f('admission_date', e.target.value)} /></div>
                <div className="form-field"><label>Total Chemo</label><input type="number" value={form.chemo_total} onChange={e => f('chemo_total', e.target.value)} /></div>
                <div className="form-field"><label>Completed Chemo</label><input type="number" value={form.chemo_completed} onChange={e => f('chemo_completed', e.target.value)} /></div>
                <div className="form-field"><label>Hospital</label><input value={form.hospital} onChange={e => f('hospital', e.target.value)} /></div>
              </div>

              <div className="form-section-title">Fundraising & Payment</div>
              <div className="form-grid">
                <div className="form-field"><label>Target (BDT)</label><input type="number" value={form.target_amount} onChange={e => f('target_amount', e.target.value)} /></div>
                <div className="form-field"><label>Collected (BDT)</label><input type="number" value={form.collected_amount} onChange={e => f('collected_amount', e.target.value)} /></div>
                <div className="form-field form-field-full"><label>Description</label><textarea value={form.fund_description} onChange={e => f('fund_description', e.target.value)} /></div>
              </div>

              <div className="form-grid">
                <div className="form-field"><label>Bank Name</label><input value={form.bank_name} onChange={e => f('bank_name', e.target.value)} /></div>
                <div className="form-field"><label>Account No</label><input value={form.bank_account_no} onChange={e => f('bank_account_no', e.target.value)} /></div>
                <div className="form-field"><label>bKash</label><input value={form.bkash_no} onChange={e => f('bkash_no', e.target.value)} /></div>
                <div className="form-field"><label>Nagad</label><input value={form.nagad_no} onChange={e => f('nagad_no', e.target.value)} /></div>
              </div>

              <div className="form-field"><label>Donation QR Code</label>
                <div className="qr-upload-box" onClick={() => qrInputRef.current.click()}>
                  {qrPreview ? <img src={qrPreview} className="qr-mini-preview" /> : 'Upload QR Code'}
                </div>
                <input ref={qrInputRef} type="file" hidden onChange={e => handleFile(e, setQrPreview, setQrFile)} />
              </div>

              {formMsg && <div className={`form-msg ${formMsg.type}`}>{formMsg.text}</div>}
              <div className="form-footer"><button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Patient'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
