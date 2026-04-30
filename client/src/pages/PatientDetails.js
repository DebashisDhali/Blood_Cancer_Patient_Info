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
        <Link to="/patients" className="btn-back">← Back to Hero Gallery</Link>
      </div>

      <div className="detail-wrapper">
        <div className="modal-sidebar">
          <div className="modal-photo-box">
            {patient.photo_url ? <img src={patient.photo_url} alt={patient.name} /> : <div className="photo-placeholder">👤</div>}
          </div>
          <div className="sidebar-info">
            <h2>{patient.name}</h2>
            <div className="status-row">
              <span className={`status-tag ${patient.status}`}>{patient.status.replace(/-/g, ' ')}</span>
              <span className="status-tag" style={{ background: 'rgba(255,255,255,0.1)' }}>{patient.blood_type}</span>
            </div>
          </div>
          <div className="modal-nav">
            <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>🏥 Medical Profile</button>
            <button className={activeTab === 'fund' ? 'active' : ''} onClick={() => setActiveTab('fund')}>💰 Donation Center</button>
          </div>
        </div>

        <div className="modal-content-area">
          {activeTab === 'info' ? (
            <div className="tab-pane">
              <h4 className="section-title">Clinical Overview</h4>
              <div className="charts-row">
                <div className="chart-card">
                  <CircularProgress value={patient.chemo_completed || 0} total={patient.chemo_total || 0} color="#6366f1" label="Chemo Progress" />
                </div>
                {fund && (
                  <div className="chart-card">
                    <CircularProgress value={fund.collected_amount || 0} total={fund.target_amount || 1} color="#10b981" label="Funding Status" />
                  </div>
                )}
              </div>
              
              <h4 className="section-title">Patient Bio-Data</h4>
              <div className="info-grid-detailed">
                <div className="info-card"><label>Department</label><span>{patient.dept || 'N/A'}</span></div>
                <div className="info-card"><label>Batch</label><span>{patient.batch || 'N/A'}</span></div>
                <div className="info-card"><label>Session</label><span>{patient.session || 'N/A'}</span></div>
                <div className="info-card"><label>Age</label><span>{patient.age} Years</span></div>
                <div className="info-card"><label>Gender</label><span>{patient.gender}</span></div>
                <div className="info-card"><label>Blood Type</label><span>{patient.blood_type}</span></div>
                <div className="info-card"><label>Admission</label><span>{patient.admission_date || 'N/A'}</span></div>
                <div className="info-card"><label>Medical Center</label><span>{patient.hospital || 'N/A'}</span></div>
                <div className="info-card"><label>Consultant</label><span>{patient.doctor_name || 'N/A'}</span></div>
                <div className="info-card"><label>Cancer Stage</label><span>{patient.cancer_type}</span></div>
                <div className="info-card" style={{ gridColumn: 'span 2' }}><label>Home Address</label><span>{patient.address || 'Not Provided'}</span></div>
                <div className="info-card"><label>Emergency Contact</label><span>{patient.phone || 'N/A'}</span></div>
              </div>

              <div className="share-section-bottom">
                <h3>📢 Extend Your Support</h3>
                <p>Every share brings a new opportunity for help. Spread the word to your network.</p>
                <button className="btn-share-big" onClick={() => {
                  navigator.share({
                    title: `Support ${patient.name}'s Journey`,
                    text: `Let's help ${patient.name} overcome ${patient.cancer_type}.`,
                    url: window.location.href
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied successfully!');
                  });
                }}>Share Hero's Profile</button>
              </div>
            </div>
          ) : (
            <div className="tab-pane">
              <h4 className="section-title">Campaign Financials</h4>
              <div className="fund-hero">
                <div className="fund-stat">
                  <span className="fund-amount-label">Fundraising Target</span>
                  <strong className="fund-amount-value">৳{(fund?.target_amount || 0).toLocaleString()}</strong>
                </div>
                <div className="fund-stat" style={{ textAlign: 'right' }}>
                  <span className="fund-amount-label">Verified Collection</span>
                  <strong className="fund-amount-value" style={{ color: '#10b981' }}>৳{(fund?.collected_amount || 0).toLocaleString()}</strong>
                </div>
              </div>

              {fund?.description && (
                <div className="fund-story-box">
                  <h4 className="section-title">The Journey</h4>
                  <p className="fund-story-text">{fund.description}</p>
                </div>
              )}

              <h4 className="section-title">Official Payment Gateways</h4>
              {fund?.payment_holder_info && (
                <div className="payment-notice-box">
                  <p>📢 <strong>Note:</strong> {fund.payment_holder_info}</p>
                </div>
              )}
              <div className="payment-grid">
                <div className="payment-methods-list">
                  {fund?.bank_account_no && (
                    <div className="bank-card">
                      <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em' }}>DIRECT BANK DEPOSIT</p>
                      <p style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.75rem', color: '#0f172a' }}>{fund.bank_name}</p>
                      <p style={{ fontSize: '1.1rem', margin: '0.4rem 0', color: '#334155', fontWeight: '600' }}>A/C: {fund.bank_account_no}</p>
                      <p style={{ color: '#64748b', fontWeight: '500' }}>{fund.bank_account_name}</p>
                      <small style={{ display: 'block', marginTop: '1rem', color: '#94a3b8' }}>{fund.bank_branch}</small>
                    </div>
                  )}

                  <div className="mobile-grid">
                    {fund?.bkash_no && <div className="mobile-card"><label>bKash Agent/Personal</label><strong>{fund.bkash_no}</strong></div>}
                    {fund?.nagad_no && <div className="mobile-card"><label>Nagad Personal</label><strong>{fund.nagad_no}</strong></div>}
                    {fund?.rocket_no && <div className="mobile-card"><label>Rocket</label><strong>{fund.rocket_no}</strong></div>}
                    {fund?.upay_no && <div className="mobile-card"><label>Upay Wallet</label><strong>{fund.upay_no}</strong></div>}
                  </div>
                </div>

                <div className="qr-container">
                  <h4 className="section-title" style={{ marginBottom: '1rem' }}>Secure QR Scan</h4>
                  {fund?.qr_code_url ? (
                    <div className="qr-frame">
                      <img src={fund.qr_code_url} alt="Donation QR" />
                    </div>
                  ) : <div style={{ padding: '3rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>No QR Linked</div>}
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>Scan and support instantly</p>
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
