import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Patients.css'; // Reuse drawer styles

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/patients/${id}`);
        setPatient(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const CircularProgress = ({ value, total, color, label }) => {
    const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <div className="chart-item">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
          <text x="50" y="55" textAnchor="middle" className="chart-text" fill="#1f2937" fontWeight="bold">{Math.round(pct)}%</text>
        </svg>
        <div className="chart-label">{label}</div>
        <div className="chart-subtext">{value} / {total}</div>
      </div>
    );
  };

  if (loading) return <div className="patients-loading"><div className="spinner" /></div>;
  if (!patient) return <div className="error-page"><h2>Patient not found</h2><Link to="/patients">Back to List</Link></div>;

  const fund = patient.fund;

  return (
    <div className="patients-page single-view">
      <div className="back-nav">
        <Link to="/patients" className="btn-back">← Back to All Patients</Link>
      </div>

      <div className="patient-detail-container">
        <div className="modal-sidebar">
          <div className="modal-photo-box">
            {patient.photo_url ? <img src={patient.photo_url} alt={patient.name} /> : <div className="photo-placeholder">👤</div>}
          </div>
          <div className="sidebar-info">
            <h2>{patient.name}</h2>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className={`status-tag ${patient.status}`}>{patient.status.replace(/-/g, ' ')}</span>
              <span className="status-tag" style={{ background: 'rgba(255,255,255,0.1)' }}>{patient.blood_type}</span>
            </div>
          </div>
          <div className="modal-nav">
            <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>🏥 Medical</button>
            <button className={activeTab === 'fund' ? 'active' : ''} onClick={() => setActiveTab('fund')}>💰 Donation</button>
          </div>
        </div>

        <div className="modal-content-area">
          {activeTab === 'info' ? (
            <div className="tab-pane">
              <h3>📊 Treatment Progress</h3>
              <div className="charts-row">
                <CircularProgress value={patient.chemo_completed || 0} total={patient.chemo_total || 0} color="#7c3aed" label="Chemo" />
                {fund && (
                  <CircularProgress value={fund.collected_amount || 0} total={fund.target_amount || 1} color="#10b981" label="Fund" />
                )}
              </div>
              
              <h3>🏥 Patient Information</h3>
              <div className="info-grid-detailed">
                <div className="info-box"><strong>Age</strong>{patient.age} Years</div>
                <div className="info-box"><strong>Cancer Type</strong>{patient.cancer_type}</div>
                <div className="info-box"><strong>Admission</strong>{patient.admission_date || 'N/A'}</div>
                <div className="info-box"><strong>Hospital</strong>{patient.hospital || 'N/A'}</div>
                <div className="info-box"><strong>Specialist</strong>{patient.doctor_name || 'N/A'}</div>
              </div>

              <div className="share-section-bottom">
                <h3>📢 Help by Sharing</h3>
                <p>Sharing this profile can help raise funds faster.</p>
                <button className="btn-share-big" onClick={() => {
                  navigator.share({
                    title: `Support ${patient.name}'s Fight`,
                    text: `Please help ${patient.name} in their battle against ${patient.cancer_type}.`,
                    url: window.location.href
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  });
                }}>Share This Profile</button>
              </div>
            </div>
          ) : (
            <div className="tab-pane">
              <h3>💸 Fundraising Status</h3>
              <div className="fund-summary-box">
                <div className="fund-stat"><span>Target</span><strong>৳{(fund?.target_amount || 0).toLocaleString()}</strong></div>
                <div className="fund-stat"><span>Raised</span><strong>৳{(fund?.collected_amount || 0).toLocaleString()}</strong></div>
              </div>

              <h3>💳 Payment Methods</h3>
              <div className="payment-grid">
                <div className="payment-methods">
                  {fund?.bank_account_no && (
                    <div className="pay-card bank">
                      <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>BANK ACCOUNT</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: '700', marginTop: '0.5rem' }}>{fund.bank_name}</p>
                      <p style={{ margin: '0.2rem 0' }}>A/C: {fund.bank_account_no}</p>
                      <p style={{ color: '#64748b' }}>{fund.bank_account_name}</p>
                      <small style={{ display: 'block', marginTop: '0.5rem', color: '#94a3b8' }}>{fund.bank_branch}</small>
                    </div>
                  )}

                  <div className="mobile-pay-grid">
                    {fund?.bkash_no && <div className="m-pay"><span>bKash</span><strong>{fund.bkash_no}</strong></div>}
                    {fund?.nagad_no && <div className="m-pay"><span>Nagad</span><strong>{fund.nagad_no}</strong></div>}
                    {fund?.rocket_no && <div className="m-pay"><span>Rocket</span><strong>{fund.rocket_no}</strong></div>}
                    {fund?.upay_no && <div className="m-pay"><span>Upay</span><strong>{fund.upay_no}</strong></div>}
                  </div>
                </div>

                <div className="qr-section">
                  <h3>🖼️ Scan to Donate</h3>
                  {fund?.qr_code_url ? (
                    <div className="qr-display-box">
                      <img src={fund.qr_code_url} alt="Donation QR" />
                      <p>Save & Scan QR</p>
                    </div>
                  ) : <div className="qr-placeholder" style={{ padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>No QR Code Provided</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
