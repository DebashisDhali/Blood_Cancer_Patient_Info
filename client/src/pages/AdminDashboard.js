import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const EMPTY_FORM = {
  name: '', age: '', gender: 'male', blood_type: '', cancer_type: '',
  phone: '', email: '', address: '', doctor_name: '', hospital: '',
  status: 'in-treatment', target_amount: '', fund_description: ''
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);    // base64 string
  const [photoPreview, setPhotoPreview] = useState(null); // data URL for preview
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ── Photo handler ── */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormMsg({ type: 'error', text: 'Photo must be under 5MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setPhotoFile(reader.result.split(',')[1]); // base64 only
    };
    reader.readAsDataURL(file);
  };

  /* ── Open add form ── */
  const openAdd = () => {
    setEditPatient(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormMsg(null);
    setShowForm(true);
  };

  /* ── Open edit form ── */
  const openEdit = (patient) => {
    setEditPatient(patient);
    setForm({
      name: patient.name || '', age: patient.age || '',
      gender: patient.gender || 'male',
      blood_type: patient.blood_type || '', cancer_type: patient.cancer_type || '',
      phone: patient.phone || '', email: patient.email || '',
      address: patient.address || '', doctor_name: patient.doctor_name || '',
      hospital: patient.hospital || '', status: patient.status || 'in-treatment',
      target_amount: patient.fund?.target_amount || '',
      fund_description: patient.fund?.description || ''
    });
    setPhotoFile(null);
    setPhotoPreview(patient.photo_url || null);
    setFormMsg(null);
    setShowForm(true);
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg(null);
    try {
      const payload = {
        name: form.name, age: Number(form.age), gender: form.gender,
        blood_type: form.blood_type, cancer_type: form.cancer_type,
        phone: form.phone, email: form.email, address: form.address,
        doctor_name: form.doctor_name, hospital: form.hospital, status: form.status
      };

      let patientId;
      if (editPatient) {
        await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editPatient.id}`, payload, { headers });
        patientId = editPatient.id;
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, payload, { headers });
        patientId = res.data.id;
      }

      // Upload photo if newly selected
      if (photoFile) {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/patients/${patientId}/photo`, { photo: photoFile }, { headers });
        } catch (photoErr) {
          setFormMsg({ type: 'error', text: 'Patient saved but photo upload failed. Try again.' });
          setFormLoading(false);
          await fetchData();
          return;
        }
      }

      // Fund
      if (form.target_amount) {
        const fundPayload = { patient_id: patientId, target_amount: Number(form.target_amount), currency: 'BDT', description: form.fund_description };
        if (editPatient?.fund) {
          await axios.put(`${process.env.REACT_APP_API_URL}/funds/${editPatient.fund.id}`, fundPayload, { headers });
        } else {
          await axios.post(`${process.env.REACT_APP_API_URL}/funds`, fundPayload, { headers });
        }
      }

      setFormMsg({ type: 'success', text: editPatient ? '✅ Patient updated!' : '✅ Patient added successfully!' });
      await fetchData();
      setTimeout(() => { setShowForm(false); setFormMsg(null); }, 1200);
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setFormLoading(false);
    }
  };

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  if (loading) return <div className="dash-loading"><div className="spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="admin-dash">
      {/* Top Bar */}
      <div className="dash-topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dash-subtitle">Welcome back, <strong>{user?.username || user?.email || 'Admin'}</strong></p>
        </div>
        <button className="btn-add-patient" onClick={openAdd}>+ Add Patient</button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="dash-stats">
          {[
            { icon: '🧬', label: 'Total Patients', value: stats.totalPatients },
            { icon: '💰', label: 'Active Funds', value: stats.activeFunds },
            { icon: '৳', label: 'Total Collected', value: `${(stats.totalCollected || 0).toLocaleString()}` },
            { icon: '📄', label: 'Documents', value: stats.totalDocuments },
          ].map((s, i) => (
            <div className="dash-stat-card" key={i}>
              <div className="dsc-icon">{s.icon}</div>
              <div>
                <div className="dsc-value">{s.value}</div>
                <div className="dsc-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Table */}
      <div className="dash-table-wrap">
        <h2>All Patients</h2>
        {patients.length === 0 ? (
          <div className="dash-empty">No patients yet. Click "Add Patient" to get started.</div>
        ) : (
          <div className="table-scroll">
            <table className="dash-table">
              <thead>
                <tr><th>Patient</th><th>Cancer Type</th><th>Blood</th><th>Status</th><th>Fund Progress</th><th>Action</th></tr>
              </thead>
              <tbody>
                {patients.map((p) => {
                  const pct = p.fund ? Math.min(100, (p.fund.collected_amount / p.fund.target_amount) * 100).toFixed(1) : null;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="tbl-patient-cell">
                          {p.photo_url
                            ? <img src={p.photo_url} alt={p.name} className="tbl-avatar" />
                            : <div className="tbl-avatar-placeholder">👤</div>
                          }
                          <div>
                            <div className="tbl-name">{p.name}</div>
                            <div className="tbl-age">{p.age ? `${p.age} yrs` : ''} {p.gender || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.cancer_type || '—'}</td>
                      <td>{p.blood_type || '—'}</td>
                      <td><span className={`tbl-badge ${p.status === 'recovered' ? 'green' : p.status === 'critical' ? 'red' : 'purple'}`}>{p.status?.replace(/-/g,' ')}</span></td>
                      <td>
                        {pct !== null ? (
                          <div className="tbl-progress">
                            <div className="tbl-bar"><div className="tbl-bar-fill" style={{ width: `${pct}%` }} /></div>
                            <span>{pct}%</span>
                          </div>
                        ) : <span className="tbl-no-fund">No fund</span>}
                      </td>
                      <td><button className="btn-edit" onClick={() => openEdit(p)}>✏️ Edit</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── FORM MODAL ── */}
      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={e => e.stopPropagation()}>
            <div className="form-modal-header">
              <h3>{editPatient ? '✏️ Edit Patient' : '➕ Add New Patient'}</h3>
              <button className="form-close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="patient-form">
              {/* Photo Upload */}
              <div className="photo-upload-section">
                <div className="photo-preview-wrap" onClick={() => fileInputRef.current?.click()}>
                  {photoPreview
                    ? <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                    : <div className="photo-preview-placeholder"><span>📷</span><p>Click to upload photo</p></div>
                  }
                  <div className="photo-overlay">Change Photo</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <p className="photo-hint">JPG, PNG or WebP · Max 5MB</p>
              </div>

              {/* Basic Info */}
              <div className="form-section-title">Patient Information</div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input required value={form.name} onChange={e => f('name', e.target.value)} placeholder="Patient full name" />
                </div>
                <div className="form-field">
                  <label>Age *</label>
                  <input required type="number" min="1" max="120" value={form.age} onChange={e => f('age', e.target.value)} placeholder="e.g. 35" />
                </div>
                <div className="form-field">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => f('gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Blood Type</label>
                  <select value={form.blood_type} onChange={e => f('blood_type', e.target.value)}>
                    <option value="">Select...</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Cancer Type</label>
                  <input value={form.cancer_type} onChange={e => f('cancer_type', e.target.value)} placeholder="e.g. Leukemia, Lymphoma" />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => f('status', e.target.value)}>
                    <option value="in-treatment">In Treatment</option>
                    <option value="critical">Critical</option>
                    <option value="stable">Stable</option>
                    <option value="recovered">Recovered</option>
                  </select>
                </div>
              </div>

              <div className="form-section-title">Contact & Hospital</div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="patient@email.com" />
                </div>
                <div className="form-field form-field-full">
                  <label>Address</label>
                  <input value={form.address} onChange={e => f('address', e.target.value)} placeholder="Full address" />
                </div>
                <div className="form-field">
                  <label>Doctor Name</label>
                  <input value={form.doctor_name} onChange={e => f('doctor_name', e.target.value)} placeholder="Dr. Name" />
                </div>
                <div className="form-field">
                  <label>Hospital</label>
                  <input value={form.hospital} onChange={e => f('hospital', e.target.value)} placeholder="Hospital / Clinic" />
                </div>
              </div>

              <div className="form-section-title">Fundraising Campaign</div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Target Amount (BDT)</label>
                  <input type="number" min="0" value={form.target_amount} onChange={e => f('target_amount', e.target.value)} placeholder="e.g. 500000" />
                </div>
                <div className="form-field form-field-full">
                  <label>Campaign Description</label>
                  <textarea value={form.fund_description} onChange={e => f('fund_description', e.target.value)} placeholder="Why does this patient need support?" rows={3} />
                </div>
              </div>

              {formMsg && <div className={`form-msg ${formMsg.type}`}>{formMsg.text}</div>}

              <div className="form-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-save" disabled={formLoading}>
                  {formLoading ? 'Saving...' : (editPatient ? 'Update Patient' : 'Add Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
