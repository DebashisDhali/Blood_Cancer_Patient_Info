import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientCard from '../components/PatientCard';
import '../styles/Patients.css';

const statusColor = (s) => {
  if (s === 'recovered') return '#10b981';
  if (s === 'critical') return '#dc2626';
  return '#7c3aed';
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [funds, setFunds] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // full patient object

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/patients`);
        setPatients(res.data);
        // Fetch funds in parallel
        const fundMap = {};
        await Promise.all(
          res.data.map(async (p) => {
            try {
              const fr = await axios.get(`${process.env.REACT_APP_API_URL}/funds/patient/${p.id}`);
              fundMap[p.id] = fr.data;
            } catch (_) {}
          })
        );
        setFunds(fundMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="patients-loading">
      <div className="spinner" />
      <p>Loading patients...</p>
    </div>
  );

  const selectedFund = selected ? funds[selected.id] : null;
  const progress = selectedFund
    ? Math.min(100, ((selectedFund.collected_amount / selectedFund.target_amount) * 100)).toFixed(1)
    : 0;

  return (
    <div className="patients-page">
      {/* Header */}
      <div className="patients-header">
        <h1>🩸 Blood Cancer Patients</h1>
        <p>Each card represents a real person fighting for their life. Your support can change everything.</p>
      </div>

      {/* Grid */}
      {patients.length === 0 ? (
        <div className="empty-state">
          <span>🏥</span>
          <p>No patients found at this time.</p>
        </div>
      ) : (
        <div className="patients-grid">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              fund={funds[patient.id]}
              onClick={() => setSelected(patient)}
            />
          ))}
        </div>
      )}

      {/* Patient Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="patient-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>

            {/* Photo */}
            <div className="modal-photo-wrap">
              {selected.photo_url
                ? <img src={selected.photo_url} alt={selected.name} className="modal-photo" />
                : <div className="modal-photo-placeholder">👤</div>
              }
              <span className="modal-status-badge" style={{ background: statusColor(selected.status) }}>
                {selected.status?.replace(/-/g, ' ') || 'In Treatment'}
              </span>
            </div>

            {/* Name */}
            <div className="modal-body">
              <h2 className="modal-name">{selected.name}</h2>
              <p className="modal-cancer">{selected.cancer_type || 'Blood Cancer'}</p>

              {/* Info Grid */}
              <div className="modal-info-grid">
                {[
                  { label: 'Age', value: selected.age ? `${selected.age} years` : '—' },
                  { label: 'Gender', value: selected.gender || '—' },
                  { label: 'Blood Type', value: selected.blood_type || '—' },
                  { label: 'Cancer Type', value: selected.cancer_type || '—' },
                  { label: 'Doctor', value: selected.doctor_name || '—' },
                  { label: 'Hospital', value: selected.hospital || '—' },
                ].map(({ label, value }) => (
                  <div className="modal-info-item" key={label}>
                    <span className="modal-info-label">{label}</span>
                    <span className="modal-info-value">{value}</span>
                  </div>
                ))}
              </div>

              {/* Fund Progress */}
              {selectedFund ? (
                <div className="modal-fund">
                  <h3>💰 Fundraising Progress</h3>
                  {selectedFund.description && (
                    <p className="fund-desc-text">{selectedFund.description}</p>
                  )}
                  <div className="modal-progress-bar">
                    <div className="modal-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="modal-fund-numbers">
                    <span className="collected">৳{(selectedFund.collected_amount || 0).toLocaleString()} collected</span>
                    <span className="target">Goal: ৳{(selectedFund.target_amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="modal-progress-pct">{progress}% funded</div>

                  {/* Donation Guide */}
                  <div className="donation-guide">
                    <h4>🤝 How to Help</h4>
                    <div className="donation-methods">
                      <div className="d-method">
                        <strong>🏦 Bank Transfer</strong>
                        <span>Contact organization for bank details</span>
                      </div>
                      <div className="d-method">
                        <strong>📱 bKash / Nagad / Rocket</strong>
                        <span>Contact for mobile banking numbers</span>
                      </div>
                      <div className="d-method">
                        <strong>🌐 International</strong>
                        <span>SWIFT transfer available on request</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="modal-no-fund">No fundraising campaign active yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
