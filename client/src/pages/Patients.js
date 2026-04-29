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
                <span className={`status-tag ${selected.status}`}>{selected.status.replace(/-/g, ' ')}</span>
                <p className="cancer-type">{selected.cancer_type}</p>
              </div>
              <div className="modal-nav">
                <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>Medical Info</button>
                <button className={activeTab === 'fund' ? 'active' : ''} onClick={() => setActiveTab('fund')}>Donation & Payment</button>
              </div>
            </div>

            <div className="modal-content-area">
              {activeTab === 'info' ? (
                <div className="tab-pane">
                  <h3>🏥 Treatment Overview</h3>
                  <div className="charts-row">
                    <CircularProgress value={selected.chemo_completed || 0} total={selected.chemo_total || 0} color="#7c3aed" label="Chemo Sessions" />
                    {selectedFund && (
                      <CircularProgress value={selectedFund.collected_amount || 0} total={selectedFund.target_amount || 1} color="#10b981" label="Fund Raised" />
                    )}
                  </div>
                  
                  <div className="info-grid-detailed">
                    <div className="info-box"><strong>Age</strong>{selected.age} yrs</div>
                    <div className="info-box"><strong>Blood Type</strong>{selected.blood_type}</div>
                    <div className="info-box"><strong>Admission Date</strong>{selected.admission_date || 'N/A'}</div>
                    <div className="info-box"><strong>Hospital</strong>{selected.hospital || 'N/A'}</div>
                    <div className="info-box"><strong>Doctor</strong>{selected.doctor_name || 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div className="tab-pane">
                  <h3>💰 Payment Details</h3>
                  <div className="fund-summary-box">
                    <div className="fund-stat"><span>Target</span><strong>৳{(selectedFund?.target_amount || 0).toLocaleString()}</strong></div>
                    <div className="fund-stat"><span>Collected</span><strong>৳{(selectedFund?.collected_amount || 0).toLocaleString()}</strong></div>
                  </div>

                  <div className="payment-grid">
                    <div className="payment-methods">
                      <h4>Bank Account</h4>
                      {selectedFund?.bank_account_no ? (
                        <div className="pay-card bank">
                          <p><strong>{selectedFund.bank_name}</strong></p>
                          <p>A/C: {selectedFund.bank_account_no}</p>
                          <p>Name: {selectedFund.bank_account_name}</p>
                          <small>{selectedFund.bank_branch}</small>
                        </div>
                      ) : <p className="none">No bank info provided</p>}

                      <h4>Mobile Banking</h4>
                      <div className="mobile-pay-grid">
                        {selectedFund?.bkash_no && <div className="m-pay bkash"><span>bKash</span><strong>{selectedFund.bkash_no}</strong></div>}
                        {selectedFund?.nagad_no && <div className="m-pay nagad"><span>Nagad</span><strong>{selectedFund.nagad_no}</strong></div>}
                        {selectedFund?.rocket_no && <div className="m-pay rocket"><span>Rocket</span><strong>{selectedFund.rocket_no}</strong></div>}
                        {selectedFund?.upay_no && <div className="m-pay upay"><span>Upay</span><strong>{selectedFund.upay_no}</strong></div>}
                      </div>
                    </div>

                    <div className="qr-section">
                      <h4>Scan to Pay</h4>
                      {selectedFund?.qr_code_url ? (
                        <div className="qr-display-box">
                          <img src={selectedFund.qr_code_url} alt="Donation QR" />
                          <p>Save & Scan QR Code</p>
                        </div>
                      ) : <div className="qr-placeholder">No QR Code Available</div>}
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
