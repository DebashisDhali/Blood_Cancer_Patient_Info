import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
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
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
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
  }, [token, navigate]);

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
          resolve({
            preview: dataUrl,
            base64: dataUrl.split(',')[1]
          });
        };
      };
    });
  };

  const handleFile = async (e, setP, setF) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setP(localPreview);

    // Compress in background
    const compressed = await compressImage(file);
    setP(compressed.preview);
    setF(compressed.base64);
  };

  const openAdd = () => { setEditPatient(null); setForm(EMPTY_FORM); setPhotoPreview(null); setQrPreview(null); setFormMsg(null); setShowForm(true); };

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
      setLogForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
      fetchLogs(editPatient.fund.id);
      fetchData();
    } catch (e) { alert('Failed to add log'); }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/donations/${logId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs(editPatient.fund.id);
      fetchData();
    } catch (e) { alert('Delete failed'); }
  };

  const [docs, setDocs] = useState([]);
  const [docForm, setDocForm] = useState({ title: '', type: 'report', file: null });

  const fetchDocs = async (pid) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/documents/patient/${pid}`);
      setDocs(res.data);
    } catch (e) { console.error(e); }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !editPatient) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/documents/${editPatient.id}`, {
          title: docForm.title || file.name,
          document_type: docForm.type,
          file: base64
        }, { headers: { Authorization: `Bearer ${token}` } });
        setDocForm({ title: '', type: 'report', file: null });
        fetchDocs(editPatient.id);
      } catch (err) { alert('Upload failed'); }
    };
  };

  const deleteDoc = async (id) => {
    if (!window.confirm("Delete document?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDocs(editPatient.id);
    } catch (e) { alert('Delete failed'); }
  };

  const openEdit = (p) => {
    setEditPatient(p);
    setForm({
      ...EMPTY_FORM, ...p,
      target_amount: p.fund?.target_amount || '',
      collected_amount: p.fund?.collected_amount || 0,
      fund_description: p.fund?.description || '',
      payment_holder_info: p.fund?.payment_holder_info || '',
      bank_name: p.fund?.bank_name || '', bank_account_name: p.fund?.bank_account_name || '',
      bank_account_no: p.fund?.bank_account_no || '', bank_branch: p.fund?.bank_branch || '',
      bkash_no: p.fund?.bkash_no || '', nagad_no: p.fund?.nagad_no || '',
      rocket_no: p.fund?.rocket_no || '', upay_no: p.fund?.upay_no || ''
    });
    setPhotoPreview(p.photo_url);
    setQrPreview(p.fund?.qr_code_url);
    if (p.fund?.id) fetchLogs(p.fund.id);
    fetchDocs(p.id);
    setFormMsg(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
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
        await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editPatient.id}`, patientData, { headers }); 
        pid = editPatient.id; 
      } else { 
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, patientData, { headers }); 
        pid = res.data.id; 
      }

      // Parallelize remaining tasks
      const saveTasks = [];

      // 1. Photo Upload
      if (photoFile) {
        saveTasks.push(axios.post(`${process.env.REACT_APP_API_URL}/patients/${pid}/photo`, { photo: photoFile }, { headers }));
      }

      // 2. Fund & QR (QR depends on fid)
      if (form.target_amount) {
        const fundSave = async () => {
          const fPayload = {
            patient_id: pid, target_amount: Number(form.target_amount), collected_amount: Number(form.collected_amount),
            description: form.fund_description, bank_name: form.bank_name, bank_account_name: form.bank_account_name,
            bank_account_no: form.bank_account_no, bank_branch: form.bank_branch,
            bkash_no: form.bkash_no, nagad_no: form.nagad_no, rocket_no: form.rocket_no, upay_no: form.upay_no
          };
          
          let fid;
          if (editPatient?.fund) { 
            await axios.put(`${process.env.REACT_APP_API_URL}/funds/${editPatient.fund.id}`, fPayload, { headers }); 
            fid = editPatient.fund.id; 
          } else { 
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/funds`, fPayload, { headers }); 
            fid = res.data.id; 
          }
          
          if (qrFile) {
            await axios.post(`${process.env.REACT_APP_API_URL}/funds/${fid}/qr`, { photo: qrFile }, { headers });
          }
        };
        saveTasks.push(fundSave());
      }

      await Promise.all(saveTasks);

      setFormMsg({ type: 'success', text: '✅ Saved successfully!' });
      await fetchData();
      setTimeout(() => setShowForm(false), 1000);
    } catch (err) { setFormMsg({ type: 'error', text: err.response?.data?.message || err.message }); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete patient "${name}"? This action cannot be undone.`)) return;
    
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
    } catch (error) {
      alert('Delete failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelf = async () => {
    const confirm1 = window.confirm("Are you absolutely sure you want to delete YOUR administrator account?");
    if (!confirm1) return;
    const confirm2 = window.confirm("CRITICAL: This action cannot be undone. You will lose all access immediately. Proceed?");
    if (!confirm2) return;

    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Clear session and redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      alert('Deletion failed: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="dash-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-dash">
      <div className="dash-topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dash-subtitle">Welcome back, <strong>{user?.username || user?.email || 'Admin'}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-delete-self" onClick={handleDeleteSelf}>Delete My Account</button>
          <button className="btn-add-patient" onClick={openAdd}>+ Add Patient</button>
        </div>
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
                  <td>
                    <div className="tbl-patient-cell">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt={p.name} className="tbl-avatar" />
                      ) : (
                        <div className="tbl-avatar-placeholder">👤</div>
                      )}
                      <div>
                        <div className="tbl-name">{p.name}</div>
                        <div className="tbl-age">{p.age} yrs • {p.gender}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#334155' }}>{p.cancer_type}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.hospital}</div>
                  </td>
                  <td>
                    <span className={`tbl-badge ${p.status === 'recovered' ? 'green' : p.status === 'critical' ? 'red' : 'purple'}`}>
                      {p.status.replace(/-/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700' }}>{p.chemo_completed}/{p.chemo_total}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Rounds Completed</div>
                  </td>
                  <td>
                    {p.fund ? (
                      <div>
                        <div style={{ fontWeight: '700', color: '#10b981' }}>
                          {Math.min(100, (p.fund.collected_amount / p.fund.target_amount) * 100).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          ৳{p.fund.collected_amount.toLocaleString()} Raised
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>No Campaign</span>
                    )}
                  </td>
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

      {showForm && (
        <div className="form-overlay" onClick={() => setShowForm(false)}>
          <div className="form-modal" onClick={e => e.stopPropagation()}>
            <div className="form-modal-header"><h3>{editPatient ? 'Edit Patient' : 'Add Patient'}</h3><button onClick={() => setShowForm(false)}>✕</button></div>
            <form onSubmit={handleSubmit} className="patient-form">
              <div className="form-section-title">Photo & Profile</div>
              <div className="photo-upload-section">
                <div className="photo-preview-wrap" onClick={() => fileInputRef.current.click()}>
                  {photoPreview ? <img src={photoPreview} alt="Profile Preview" className="photo-preview-img" /> : '📷'}
                </div>
                <input ref={fileInputRef} type="file" hidden onChange={e => handleFile(e, setPhotoPreview, setPhotoFile)} />
                <small className="photo-hint">Max 2MB recommended for best speed</small>
              </div>

              <div className="form-grid">
                <div className="form-field"><label>Name</label><input required value={form.name} onChange={e => f('name', e.target.value)} /></div>
                <div className="form-field"><label>Age</label><input type="number" value={form.age} onChange={e => f('age', e.target.value)} /></div>
                <div className="form-field"><label>Gender</label><select value={form.gender} onChange={e => f('gender', e.target.value)}><option value="male">Male</option><option value="female">Female</option></select></div>
                <div className="form-field"><label>Blood</label><input value={form.blood_type} onChange={e => f('blood_type', e.target.value)} /></div>
                <div className="form-field"><label>Cancer</label><input value={form.cancer_type} onChange={e => f('cancer_type', e.target.value)} /></div>
                <div className="form-field"><label>Status</label><select value={form.status} onChange={e => f('status', e.target.value)}><option value="in-treatment">In Treatment</option><option value="critical">Critical</option><option value="recovered">Recovered</option></select></div>
              </div>

              <div className="form-section-title">Academic Information</div>
              <div className="form-grid">
                <div className="form-field"><label>Department</label><input placeholder="e.g. CSE" value={form.dept} onChange={e => f('dept', e.target.value)} /></div>
                <div className="form-field"><label>Batch</label><input placeholder="e.g. 50th" value={form.batch} onChange={e => f('batch', e.target.value)} /></div>
                <div className="form-field"><label>Session</label><input placeholder="e.g. 2021-22" value={form.session} onChange={e => f('session', e.target.value)} /></div>
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
                <div className="form-field form-field-full"><label>Account Holder Info</label><input placeholder="e.g. Accounts belong to Patient's Father" value={form.payment_holder_info} onChange={e => f('payment_holder_info', e.target.value)} /></div>
                <div className="form-field form-field-full"><label>Campaign Story</label><textarea value={form.fund_description} onChange={e => f('fund_description', e.target.value)} /></div>
              </div>

              <div className="form-grid">
                <div className="form-field"><label>Bank Name</label><input value={form.bank_name} onChange={e => f('bank_name', e.target.value)} /></div>
                <div className="form-field"><label>Account No</label><input value={form.bank_account_no} onChange={e => f('bank_account_no', e.target.value)} /></div>
                <div className="form-field"><label>bKash</label><input value={form.bkash_no} onChange={e => f('bkash_no', e.target.value)} /></div>
                <div className="form-field"><label>Nagad</label><input value={form.nagad_no} onChange={e => f('nagad_no', e.target.value)} /></div>
              </div>

              {editPatient?.fund && (
                <div className="fund-ledger-section">
                  <div className="form-section-title">Daily Fund Ledger (Auto-Calculating)</div>
                  <div className="ledger-input-row">
                    <input type="date" value={logForm.date} onChange={e => setLogForm({ ...logForm, date: e.target.value })} />
                    <input type="number" placeholder="Amount (৳)" value={logForm.amount} onChange={e => setLogForm({ ...logForm, amount: e.target.value })} />
                    <input type="text" placeholder="Note (Optional)" value={logForm.note} onChange={e => setLogForm({ ...logForm, note: e.target.value })} />
                    <button type="button" className="btn-add-log" onClick={handleAddLog}>Add Log</button>
                  </div>
                  
                  <div className="ledger-table-wrap">
                    <table className="ledger-table">
                      <thead><tr><th>Date</th><th>Amount</th><th>Note</th><th>Action</th></tr></thead>
                      <tbody>
                        {donationLogs.map(log => (
                          <tr key={log.id}>
                            <td>{new Date(log.date).toLocaleDateString()}</td>
                            <td style={{ fontWeight: '700', color: '#10b981' }}>৳{Number(log.amount).toLocaleString()}</td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{log.note || '-'}</td>
                            <td><button type="button" className="btn-delete-log" onClick={() => handleDeleteLog(log.id)}>✕</button></td>
                          </tr>
                        ))}
                        {donationLogs.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>No daily logs yet</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {editPatient && (
                <div className="docs-ledger-section">
                  <div className="form-section-title">Medical Reports & Prescriptions</div>
                  <div className="doc-upload-box">
                    <input type="text" placeholder="Document Title (e.g. Bone Marrow Test)" value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} />
                    <select value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value })}>
                      <option value="report">Medical Report</option>
                      <option value="prescription">Prescription</option>
                      <option value="other">Other</option>
                    </select>
                    <label className="btn-upload-doc">
                      📎 Choose & Upload
                      <input type="file" hidden onChange={handleDocUpload} accept="application/pdf,image/*" />
                    </label>
                  </div>

                  <div className="docs-list">
                    {docs.map(d => (
                      <div key={d.id} className="doc-item">
                        <div className="doc-info">
                          <span className="doc-icon">{d.document_type === 'prescription' ? '💊' : '📄'}</span>
                          <div>
                            <div className="doc-title">{d.title}</div>
                            <div className="doc-meta">{d.document_type} • {new Date(d.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="doc-actions">
                          <a href={d.file_url} target="_blank" rel="noreferrer" className="btn-view-doc">View File</a>
                          <button type="button" className="btn-delete-doc" onClick={() => deleteDoc(d.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                    {docs.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>No documents uploaded yet</p>}
                  </div>
                </div>
              )}

              <div className="form-field"><label>Donation QR Code</label>
                <div className="qr-upload-box" onClick={() => qrInputRef.current.click()}>
                  {qrPreview ? <img src={qrPreview} alt="QR Code Preview" className="qr-mini-preview" /> : 'Upload QR Code'}
                </div>
                <input ref={qrInputRef} type="file" hidden onChange={e => handleFile(e, setQrPreview, setQrFile)} />
              </div>

              {formMsg && <div className={`form-msg ${formMsg.type}`}>{formMsg.text}</div>}
              <div className="form-footer"><button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save Patient'}</button></div>
            </form>
          </div>
        </div>
      )}
      <div className="admin-help-box">
        <h3>💡 Admin Quick Guide</h3>
        <div className="help-grid-info">
          <div className="help-item">
            <strong>📸 Adding Photos</strong>
            <p>Use square photos (max 2MB). The system auto-optimizes images for speed.</p>
          </div>
          <div className="help-item">
            <strong>💰 Fund Tracking</strong>
            <p>Add daily records in the "Ledger". The system will auto-calculate the total for you.</p>
          </div>
          <div className="help-item">
            <strong>📄 Medical Docs</strong>
            <p>Upload prescriptions and reports as PDFs. View them anytime from the patient profile.</p>
          </div>
          <div className="help-item">
            <strong>🔗 Patient Share</strong>
            <p>Click "Share" on any card to get a unique link for that specific patient's public profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
