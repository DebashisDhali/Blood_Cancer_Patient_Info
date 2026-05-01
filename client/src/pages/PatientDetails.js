import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Patients.css'; // Reuse drawer styles

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fund');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const [res, docsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/patients/${id}`),
          axios.get(`${process.env.REACT_APP_API_URL}/documents/patient/${id}`)
        ]);
        setPatient(res.data);
        setDocuments(docsRes.data);
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
            <button className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>📄 Reports</button>
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
                    title: `Help ${patient.name} - Cancer Support Platform`,
                    text: `Let's stand by ${patient.name} during this difficult time. Support and share their journey.`,
                    url: window.location.href
                  }).catch(() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Profile link copied to clipboard!');
                  });
                }}>
                  📢 Share Profile to Support
                </button>
              </div>
            </div>
          ) : activeTab === 'docs' ? (
            <div className="tab-pane">
              <h4 className="section-title">Verified Medical Documents</h4>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                For transparency, we provide verified medical reports and prescriptions related to the patient's condition.
              </p>
              
              <div className="docs-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {documents.map(doc => (
                  <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="public-doc-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textDecoration: 'none', transition: '0.2s', gap: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>{doc.document_type === 'prescription' ? '💊' : '📄'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{doc.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '0.2rem' }}>{doc.document_type}</div>
                    </div>
                    <div style={{ color: '#6366f1', fontSize: '1.2rem' }}>↗</div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                    No medical documents uploaded yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="tab-pane">
              <h4 className="section-title">Campaign Financials</h4>
              
              {/* Premium Visual Progress Chart */}
              <div className="fund-visual-progress-box">
                <div className="fund-progress-meta">
                  <div className="fund-main-percent">
                    {Math.min(100, ((fund?.collected_amount || 0) / (fund?.target_amount || 1)) * 100).toFixed(1)}%
                    <span>Funded</span>
                  </div>
                  <div className="fund-mini-stats-top">
                    <div className="fms-item">
                      <label>Target</label>
                      <strong>৳{(fund?.target_amount || 0).toLocaleString()}</strong>
                    </div>
                    <div className="fms-item">
                      <label>Raised</label>
                      <strong style={{ color: '#10b981' }}>৳{(fund?.collected_amount || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
                <div className="fund-progress-bar-large">
                  <div 
                    className="fund-progress-fill-large" 
                    style={{ width: `${Math.min(100, ((fund?.collected_amount || 0) / (fund?.target_amount || 1)) * 100)}%` }}
                  >
                    <div className="progress-glow"></div>
                  </div>
                </div>
                <p className="fund-support-hint">🙏 {fund?.target_amount - fund?.collected_amount > 0 ? `Only ৳${(fund.target_amount - fund.collected_amount).toLocaleString()} more needed to reach the goal.` : 'Target reached! Your additional support helps even more.'}</p>
              </div>

              {fund?.description && (
                <div className="fund-story-box">
                  <h4 className="section-title">The Journey</h4>
                  <p className="fund-story-text">{fund.description}</p>
                </div>
              )}

              <div className="donation-methods-container">
                <h4 className="section-title">Official Payment Gateways</h4>
                
                {fund?.payment_holder_info && (
                  <div className="payment-notice-box">
                    <p>📢 <strong>Note:</strong> {fund.payment_holder_info}</p>
                  </div>
                )}

                {(fund?.bank_account_no || fund?.bank_name) ? (
                  <div className="bank-card-premium">
                    <div className="bank-card-header">
                      <span>🏛️ DIRECT BANK TRANSFER</span>
                      <div className="bank-logo-dummy">BANK</div>
                    </div>
                    <div className="bank-card-body">
                      <h3>{fund.bank_name || 'Bank Details'}</h3>
                      {fund.bank_account_no && (
                        <div className="bank-acc-row">
                          <label>Account Number</label>
                          <strong>{fund.bank_account_no}</strong>
                        </div>
                      )}
                      {fund.bank_account_name && (
                        <div className="bank-acc-row">
                          <label>Account Name</label>
                          <span>{fund.bank_account_name}</span>
                        </div>
                      )}
                      {fund.bank_branch && (
                        <div className="bank-acc-row">
                          <label>Branch</label>
                          <span>{fund.bank_branch}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-info-box">
                    <p>ℹ️ No bank account details provided for this patient.</p>
                  </div>
                )}

                <div className="mobile-payments-section">
                  <h5 className="sub-section-title">Mobile Wallets</h5>
                  <div className="mobile-grid-premium">
                    {fund?.bkash_no && (
                      <div className="m-wallet bkash">
                        <div className="m-wallet-header">
                          <img src="/images/bkash-logo.png" alt="bKash" className="m-logo" />
                          <label>bKash</label>
                        </div>
                        <strong>{fund.bkash_no}</strong>
                      </div>
                    )}
                    {fund?.nagad_no && (
                      <div className="m-wallet nagad">
                        <div className="m-wallet-header">
                          <img src="/images/nagad-logo.jpg" alt="Nagad" className="m-logo" />
                          <label>Nagad</label>
                        </div>
                        <strong>{fund.nagad_no}</strong>
                      </div>
                    )}
                    {fund?.rocket_no && (
                      <div className="m-wallet rocket">
                        <div className="m-wallet-header">
                          <label>Rocket</label>
                        </div>
                        <strong>{fund.rocket_no}</strong>
                      </div>
                    )}
                    {fund?.upay_no && (
                      <div className="m-wallet upay">
                        <div className="m-wallet-header">
                          <label>Upay</label>
                        </div>
                        <strong>{fund.upay_no}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="qr-scans-section">
                  <h5 className="sub-section-title">Scan to Donate</h5>
                  <div className="qr-grid-premium">
                    {fund?.bank_qr_url && (
                      <div className="qr-item">
                        <div className="qr-box"><img src={fund.bank_qr_url} alt="Bank QR" /></div>
                        <label>BANK QR</label>
                      </div>
                    )}
                    {fund?.bkash_qr_url && (
                      <div className="qr-item">
                        <div className="qr-box"><img src={fund.bkash_qr_url} alt="bKash QR" /></div>
                        <label>BKASH QR</label>
                      </div>
                    )}
                    {fund?.nagad_qr_url && (
                      <div className="qr-item">
                        <div className="qr-box"><img src={fund.nagad_qr_url} alt="Nagad QR" /></div>
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { documentService } from '../services/documentService';
import DonationCenter from '../components/shared/DonationCenter';
import DocumentViewer from '../components/shared/DocumentViewer';
import '../styles/Patients.css';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('fund');
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientData, docData] = await Promise.all([
          patientService.getById(id),
          documentService.getByPatientId(id)
        ]);
        setPatient(patientData);
        setDocuments(docData);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div className="loading-state">Loading patient details...</div>;
  if (!patient) return <div className="error-state">Patient not found.</div>;

  const fund = patient.fund;

  return (
    <div className="patient-details-page">
      <div className="detail-container">
        <div className="detail-wrapper">
          <div className="modal-sidebar">
            <div className="modal-photo-box">
              {patient.photo_url ? <img src={patient.photo_url} alt={patient.name} /> : <div className="photo-placeholder">👤</div>}
            </div>
            <div className="sidebar-info">
              <h2>{patient.name}</h2>
              <div className="status-row">
                <span className={`status-tag ${patient.status}`}>{patient.status.replace(/-/g, ' ')}</span>
                <span className="status-tag blood">{patient.blood_type}</span>
              </div>
            </div>
            <div className="modal-nav">
              <button className={activeTab === 'fund' ? 'active' : ''} onClick={() => setActiveTab('fund')}>💰 Donation Center</button>
              <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>🏥 Medical Info</button>
              <button className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>📄 Reports</button>
            </div>
            <div className="share-section-bottom">
              <p>Share this patient's story to help them raise funds faster.</p>
              <button className="btn-share-big" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}>🔗 Copy Share Link</button>
            </div>
          </div>

          <div className="modal-content-area">
            {activeTab === 'fund' && <DonationCenter fund={fund} />}

            {activeTab === 'info' && (
              <div className="tab-pane">
                <h4 className="section-title">Bio-Data & Records</h4>
                <div className="info-grid-detailed">
                  <div className="info-card"><label>Department</label><span>{patient.dept || 'N/A'}</span></div>
                  <div className="info-card"><label>Batch</label><span>{patient.batch || 'N/A'}</span></div>
                  <div className="info-card"><label>Session</label><span>{patient.session || 'N/A'}</span></div>
                  <div className="info-card"><label>Age</label><span>{patient.age} Years</span></div>
                  <div className="info-card"><label>Gender</label><span>{patient.gender}</span></div>
                  <div className="info-card"><label>Consultant</label><span>{patient.doctor_name || 'N/A'}</span></div>
                  <div className="info-card" style={{ gridColumn: 'span 2' }}><label>Emergency Contact</label><span>{patient.phone || 'N/A'}</span></div>
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="tab-pane">
                <h4 className="section-title">Verified Medical Documents</h4>
                <div className="docs-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {documents.map(doc => (
                    <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="public-doc-card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '1rem' }}>
                      <div style={{ fontSize: '2rem' }}>{doc.document_type === 'prescription' ? '💊' : '📄'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{doc.title}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>{doc.document_type}</div>
                      </div>
                      <div style={{ color: '#6366f1', fontSize: '1.2rem' }}>↗</div>
                    </div>
                  ))}
                  {documents.length === 0 && <div className="no-info-box">No medical documents uploaded yet.</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
};

export default PatientDetails;
