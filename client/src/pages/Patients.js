import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientCard from '../components/PatientCard';
import '../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Optimized: Single request returns patients WITH their funds
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/patients`);
        setPatients(res.data);
      } catch (err) { 
        console.error('Fetch error:', err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAll();
  }, []);

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

  const selectedFund = selected?.fund || null;

  return (
    <div className="patients-page">
      <div className="patients-header">
        <h1>🩸 Fight Against Blood Cancer</h1>
        <p>Support our heroes in their journey to recovery. Every bit of help counts.</p>
      </div>

      {loading ? (
        <div className="patients-loading"><div className="spinner" /></div>
      ) : (
        <div className="patients-grid">
          {patients.map(p => (
            <PatientCard 
              key={p.id} 
              patient={p} 
              fund={p.fund} 
              onClick={() => { setSelected(p); setActiveTab('info'); }} 
            />
          ))}
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="patient-modal wide" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            
            <div className="modal-sidebar">
              <div className="modal-photo-box">
                {selected.photo_url ? <img src={selected.photo_url} alt={selected.name} /> : <div className="photo-placeholder">👤</div>}
              </div>
              <div className="sidebar-info">
                <h2>{selected.name}</h2>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span className={`status-tag ${selected.status}`}>{selected.status.replace(/-/g, ' ')}</span>
                  <span className="status-tag" style={{ background: 'rgba(255,255,255,0.1)' }}>{selected.blood_type}</span>
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
                  <h4 className="section-title">Treatment Statistics</h4>
                  <div className="charts-row">
                    <div className="chart-card">
                      <CircularProgress value={selected.chemo_completed || 0} total={selected.chemo_total || 0} color="#6366f1" label="Chemo Rounds" />
                    </div>
                    {selectedFund && (
                      <div className="chart-card">
                        <CircularProgress value={selectedFund.collected_amount || 0} total={selectedFund.target_amount || 1} color="#10b981" label="Fund Raised" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className="section-title">Medical Record</h4>
                  <div className="info-grid-detailed">
                    <div className="info-card"><label>Patient Age</label><span>{selected.age} Years</span></div>
                    <div className="info-card"><label>Gender</label><span>{selected.gender}</span></div>
                    <div className="info-card"><label>Blood Type</label><span>{selected.blood_type}</span></div>
                    <div className="info-card"><label>Admission</label><span>{selected.admission_date || 'N/A'}</span></div>
                    <div className="info-card"><label>Institution</label><span>{selected.hospital || 'N/A'}</span></div>
                    <div className="info-card"><label>Lead Doctor</label><span>{selected.doctor_name || 'N/A'}</span></div>
                    <div className="info-card"><label>Cancer Stage</label><span>{selected.cancer_type}</span></div>
                    <div className="info-card" style={{ gridColumn: 'span 2' }}><label>Home Address</label><span>{selected.address || 'Not Provided'}</span></div>
                    <div className="info-card"><label>Emergency Contact</label><span>{selected.phone || 'N/A'}</span></div>
                  </div>
                </div>
              ) : (
                <div className="tab-pane">
                  <h4 className="section-title">Fundraising Initiative</h4>
                  <div className="fund-hero">
                    <div className="fund-stat">
                      <span className="fund-amount-label">Target Goal</span>
                      <strong className="fund-amount-value">৳{(selectedFund?.target_amount || 0).toLocaleString()}</strong>
                    </div>
                    <div className="fund-stat" style={{ textAlign: 'right' }}>
                      <span className="fund-amount-label">Amount Collected</span>
                      <strong className="fund-amount-value" style={{ color: '#10b981' }}>৳{(selectedFund?.collected_amount || 0).toLocaleString()}</strong>
                    </div>
                  </div>
 
                  {selectedFund?.description && (
                    <div className="fund-story-box">
                      <h4 className="section-title">Patient Story</h4>
                      <p className="fund-story-text">{selectedFund.description}</p>
                    </div>
                  )}
 
                  <h4 className="section-title">Secure Payment Channels</h4>
                  <div className="payment-grid">
                    <div className="payment-methods-list">
                      {selectedFund?.bank_account_no && (
                        <div className="bank-card">
                          <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em' }}>DIRECT BANK TRANSFER</p>
                          <p style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.75rem', color: '#0f172a' }}>{selectedFund.bank_name}</p>
                          <p style={{ fontSize: '1.1rem', margin: '0.4rem 0', color: '#334155', fontWeight: '600' }}>A/C: {selectedFund.bank_account_no}</p>
                          <p style={{ color: '#64748b', fontWeight: '500' }}>{selectedFund.bank_account_name}</p>
                          <small style={{ display: 'block', marginTop: '1rem', color: '#94a3b8', fontStyle: 'italic' }}>{selectedFund.bank_branch}</small>
                        </div>
                      )}
 
                      <div className="mobile-grid">
                        {selectedFund?.bkash_no && <div className="mobile-card"><label>bKash Personal</label><strong>{selectedFund.bkash_no}</strong></div>}
                        {selectedFund?.nagad_no && <div className="mobile-card"><label>Nagad Personal</label><strong>{selectedFund.nagad_no}</strong></div>}
                        {selectedFund?.rocket_no && <div className="mobile-card"><label>Rocket</label><strong>{selectedFund.rocket_no}</strong></div>}
                        {selectedFund?.upay_no && <div className="mobile-card"><label>Upay</label><strong>{selectedFund.upay_no}</strong></div>}
                      </div>
                    </div>
 
                    <div className="qr-container">
                      <h4 className="section-title" style={{ marginBottom: '1rem' }}>Instant QR Scan</h4>
                      {selectedFund?.qr_code_url ? (
                        <div className="qr-frame">
                          <img src={selectedFund.qr_code_url} alt="Donation QR" />
                        </div>
                      ) : <div style={{ padding: '3rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0', color: '#94a3b8', fontWeight: '600' }}>QR Code Not Linked</div>}
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem' }}>Save and scan to help faster</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
