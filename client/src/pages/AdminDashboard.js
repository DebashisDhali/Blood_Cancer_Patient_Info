import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const EMPTY_PATIENT = {
  name: '', age: '', gender: 'male', blood_type: '', cancer_type: '',
  phone: '', email: '', address: '', doctor_name: '', hospital: '',
  target_amount: '', fund_description: ''
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_PATIENT);
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

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
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const openAddForm = () => {
    setEditPatient(null);
    setForm(EMPTY_PATIENT);
    setFormMsg(null);
    setShowForm(true);
  };

  const openEditForm = async (patient) => {
    setEditPatient(patient);
    setForm({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || 'male',
      blood_type: patient.blood_type || '',
      cancer_type: patient.cancer_type || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      doctor_name: patient.doctor_name || '',
      hospital: patient.hospital || '',
      target_amount: patient.fund?.target_amount || '',
      fund_description: patient.fund?.description || ''
    });
    setFormMsg(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMsg(null);
    try {
      const patientPayload = {
        name: form.name, age: Number(form.age), gender: form.gender,
        blood_type: form.blood_type, cancer_type: form.cancer_type,
        phone: form.phone, email: form.email, address: form.address,
        doctor_name: form.doctor_name, hospital: form.hospital
      };

      let patientId;
      if (editPatient) {
        await axios.put(`${process.env.REACT_APP_API_URL}/patients/${editPatient.id}`, patientPayload, { headers });
        patientId = editPatient.id;
      } else {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/patients`, patientPayload, { headers });
        patientId = res.data.id;
      }

      // Create or update fund if target_amount provided
      if (form.target_amount) {
        const fundPayload = {
          patient_id: patientId,
          target_amount: Number(form.target_amount),
          currency: 'BDT',
          description: form.fund_description
        };
        if (editPatient?.fund) {
          await axios.put(`${process.env.REACT_APP_API_URL}/funds/${editPatient.fund.id}`, fundPayload, { headers });
        } else {
          await axios.post(`${process.env.REACT_APP_API_URL}/funds`, fundPayload, { headers });
        }
      }

      setFormMsg({ type: 'success', text: editPatient ? 'Patient updated successfully!' : 'Patient added successfully!' });
      await fetchData();
      setTimeout(() => { setShowForm(false); setFormMsg(null); }, 1500);
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card"><h3>Total Patients</h3><p className="stat-number">{stats.totalPatients}</p></div>
          <div className="stat-card"><h3>Active Funds</h3><p className="stat-number">{stats.activeFunds}</p></div>
          <div className="stat-card"><h3>Total Collected</h3><p className="stat-number">৳ {(stats.totalCollected || 0).toLocaleString()}</p></div>
          <div className="stat-card"><h3>Documents</h3><p className="stat-number">{stats.totalDocuments}</p></div>
        </div>
      )}

      <div className="patients-section">
        <div className="section-header">
          <h2>All Patients</h2>
          <button className="add-patient-btn" onClick={openAddForm}>+ Add Patient</button>
        </div>

        {/* Patient Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3>{editPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
              <form onSubmit={handleSubmit} className="patient-form">
                <div className="form-row">
                  <label>Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Patient full name" />
                </div>
                <div className="form-row">
                  <label>Age *</label>
                  <input required type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="Age" />
                </div>
                <div className="form-row">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Blood Type</label>
                  <input value={form.blood_type} onChange={e => setForm({...form, blood_type: e.target.value})} placeholder="e.g. A+, O-" />
                </div>
                <div className="form-row">
                  <label>Cancer Type</label>
                  <input value={form.cancer_type} onChange={e => setForm({...form, cancer_type: e.target.value})} placeholder="e.g. Leukemia" />
                </div>
                <div className="form-row">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="01XXXXXXXXX" />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="patient@example.com" />
                </div>
                <div className="form-row">
                  <label>Address</label>
                  <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" />
                </div>
                <div className="form-row">
                  <label>Doctor Name</label>
                  <input value={form.doctor_name} onChange={e => setForm({...form, doctor_name: e.target.value})} placeholder="Dr. Name" />
                </div>
                <div className="form-row">
                  <label>Hospital</label>
                  <input value={form.hospital} onChange={e => setForm({...form, hospital: e.target.value})} placeholder="Hospital name" />
                </div>
                <hr />
                <div className="form-row">
                  <label>Fund Target Amount (BDT)</label>
                  <input type="number" value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} placeholder="e.g. 500000" />
                </div>
                <div className="form-row">
                  <label>Fund Description</label>
                  <textarea value={form.fund_description} onChange={e => setForm({...form, fund_description: e.target.value})} placeholder="Why does this patient need support?" rows={3} />
                </div>
                {formMsg && (
                  <div className={`form-msg ${formMsg.type}`}>{formMsg.text}</div>
                )}
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="submit-btn" disabled={formLoading}>
                    {formLoading ? 'Saving...' : (editPatient ? 'Update' : 'Add Patient')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Cancer Type</th>
              <th>Status</th>
              <th>Fund Progress</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              const progress = patient.fund
                ? ((patient.fund.collected_amount / patient.fund.target_amount) * 100).toFixed(1)
                : 0;
              return (
                <tr key={patient.id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td>{patient.cancer_type}</td>
                  <td><span className="status-badge">{patient.status}</span></td>
                  <td>
                    <div className="progress-small">
                      <div className="progress-bar-small">
                        <div className="progress-fill-small" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span>{progress}%</span>
                    </div>
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => openEditForm(patient)}>✏️ Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
