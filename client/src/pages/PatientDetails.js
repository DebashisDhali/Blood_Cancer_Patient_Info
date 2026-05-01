import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { documentService } from '../services/documentService';
import DocumentViewer from '../components/shared/DocumentViewer';
import '../styles/Patients.css';

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('fund');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [patientData, docData] = await Promise.all([
        patientService.getById(id, {
          onUpdate: (fresh) => setPatient(fresh), // silent background update
        }),
        documentService.getByPatientId(id),
      ]);
      setPatient(patientData);
      setDocuments(docData);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return (
    <div className="loading-state">
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎗️</div>
      <span>Loading patient profile...</span>
    </div>
  );

  if (error) return (
    <div className="error-state">
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h3>Could not load patient data</h3>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        There was a network issue. Please try again.
      </p>
      <button
        onClick={loadData}
        style={{
          padding: '0.75rem 2rem', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer'
        }}
      >
        🔄 Try Again
      </button>
    </div>
  );

  if (!patient) return (
    <div className="error-state">
      <div style={{ fontSize: '3rem' }}>😔</div>
      <h3>Patient not found</h3>
    </div>
  );

  const fund = patient.fund;
  const progress = fund ? Math.min(100, ((fund.collected_amount || 0) / (fund.target_amount || 1)) * 100) : 0;

  const CircularProgress = ({ value, total, color, label, sublabel }) => {
    const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
    const r = 45;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <div className="chart-item">
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="9" />
          <circle cx="55" cy="55" r={r} fill="transparent" stroke={color} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 55 55)" />
          <text x="55" y="60" textAnchor="middle" fill="#0f172a" fontWeight="800" fontSize="20">{Math.round(pct)}%</text>
        </svg>
        <div className="chart-label">{label}</div>
        {sublabel && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{sublabel}</div>}
      </div>
    );
  };

  const InfoCard = ({ label, value, icon, wide }) => (
    <div className="info-card" style={wide ? { gridColumn: 'span 2' } : {}}>
      {icon && <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>}
      <label>{label}</label>
      <span>{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="patient-details-page">
      <div className="detail-container">
        <div className="detail-wrapper">

          {/* ── LEFT SIDEBAR ── */}
          <div className="modal-sidebar">
            <div className="modal-photo-box">
              {patient.photo_url
                ? <img src={patient.photo_url} alt={patient.name} />
                : <div className="photo-placeholder" style={{ fontSize: '4rem' }}>👤</div>}
            </div>
            <div className="sidebar-info">
              <h2>{patient.name}</h2>
              <div className="status-row">
                <span className={`status-tag ${patient.status}`}>{patient.status?.replace(/-/g, ' ')}</span>
                <span className="status-tag blood">{patient.blood_type}</span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: '1.5' }}>
                {patient.cancer_type}
              </p>
            </div>

            {/* Premium Tab Navigation */}
            <div className="detail-tab-nav">
              <button className={activeTab === 'fund' ? 'active' : ''} onClick={() => setActiveTab('fund')}>
                <span className="tab-icon">💰</span>
                <span className="tab-label">Donation Center</span>
              </button>
              <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>
                <span className="tab-icon">🏥</span>
                <span className="tab-label">Medical Info</span>
              </button>
              <button className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>
                <span className="tab-icon">📄</span>
                <span className="tab-label">Reports ({documents.length})</span>
              </button>
            </div>

            {/* Share Section */}
            <div className="share-section-bottom" style={{ marginTop: '3rem' }}>
              <p>Share this patient's story to help them raise funds faster.</p>
              <button className="btn-share-mini" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('✅ Link copied!');
              }}>🔗 Copy Link</button>
            </div>
          </div>

          {/* ── RIGHT CONTENT ── */}
          <div className="modal-content-area">

            {/* ══ TAB: DONATION CENTER ══ */}
            {activeTab === 'fund' && (
              <div className="tab-pane">
                <h4 className="section-title">💰 Campaign Financials</h4>

                {fund ? (
                  <>
                    {/* Progress Visual */}
                    <div className="fund-visual-progress-box">
                      <div className="fund-progress-meta">
                        <div className="fund-main-percent">
                          {progress.toFixed(1)}%
                          <span>Funded</span>
                        </div>
                        <div className="fund-mini-stats-top">
                          <div className="fms-item">
                            <label>Target</label>
                            <strong>৳{(fund.target_amount || 0).toLocaleString()}</strong>
                          </div>
                          <div className="fms-item">
                            <label>Raised</label>
                            <strong style={{ color: '#10b981' }}>৳{(fund.collected_amount || 0).toLocaleString()}</strong>
                          </div>
                          <div className="fms-item">
                            <label>Remaining</label>
                            <strong style={{ color: '#f59e0b' }}>
                              ৳{Math.max(0, (fund.target_amount || 0) - (fund.collected_amount || 0)).toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      </div>
                      <div className="fund-progress-bar-large">
                        <div className="fund-progress-fill-large" style={{ width: `${progress}%` }}>
                          <div className="progress-glow"></div>
                        </div>
                      </div>
                      <p className="fund-support-hint">
                        🙏 {(fund.target_amount - fund.collected_amount) > 0
                          ? `Only ৳${(fund.target_amount - fund.collected_amount).toLocaleString()} more needed to reach the goal!`
                          : '🎉 Target reached! Additional support is still welcome.'}
                      </p>
                    </div>

                    {/* Fund Story */}
                    {fund.description && (
                      <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fff7ed)', border: '1px solid #fed7aa', borderRadius: '20px', padding: '1.75rem', marginBottom: '2rem' }}>
                        <h5 style={{ color: '#92400e', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>📖 Patient's Story</h5>
                        <p style={{ color: '#78350f', lineHeight: '1.8', fontSize: '0.95rem' }}>{fund.description}</p>
                      </div>
                    )}

                    {/* Payment notice */}
                    {fund.payment_holder_info && (
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <p style={{ color: '#1e40af', fontSize: '0.9rem' }}>📢 <strong>Note:</strong> {fund.payment_holder_info}</p>
                      </div>
                    )}

                    {/* Bank Card */}
                    {(fund.bank_account_no || fund.bank_name) ? (
                      <div className="bank-card-premium">
                        <div className="bank-card-header">
                          <span>🏛️ DIRECT BANK TRANSFER</span>
                          <div className="bank-logo-dummy">BANK</div>
                        </div>
                        <div className="bank-card-body">
                          <h3>{fund.bank_name || 'Bank Details'}</h3>
                          {fund.bank_account_no && <div className="bank-acc-row"><label>Account No</label><strong>{fund.bank_account_no}</strong></div>}
                          {fund.bank_account_name && <div className="bank-acc-row"><label>Account Name</label><span>{fund.bank_account_name}</span></div>}
                          {fund.bank_branch && <div className="bank-acc-row"><label>Branch</label><span>{fund.bank_branch}</span></div>}
                          {fund.bank_routing && <div className="bank-acc-row"><label>Routing No</label><span>{fund.bank_routing}</span></div>}
                        </div>
                      </div>
                    ) : (
                      <div className="no-info-box"><p>ℹ️ No bank account details provided.</p></div>
                    )}

                    {/* Mobile Wallets */}
                    {(fund.bkash_no || fund.nagad_no || fund.rocket_no || fund.upay_no) && (
                      <div className="mobile-payments-section" style={{ marginTop: '1.5rem' }}>
                        <h5 className="sub-section-title">📱 Mobile Wallets</h5>
                        <div className="mobile-grid-premium">
                          {fund.bkash_no && (
                            <div className="m-wallet bkash">
                              <div className="m-wallet-header">
                                <img src="/images/bkash-logo.png" alt="bKash" className="m-logo" />
                                <label>bKash</label>
                              </div>
                              <strong>{fund.bkash_no}</strong>
                            </div>
                          )}
                          {fund.nagad_no && (
                            <div className="m-wallet nagad">
                              <div className="m-wallet-header">
                                <img src="/images/nagad-logo.jpg" alt="Nagad" className="m-logo" />
                                <label>Nagad</label>
                              </div>
                              <strong>{fund.nagad_no}</strong>
                            </div>
                          )}
                          {fund.rocket_no && (
                            <div className="m-wallet rocket">
                              <div className="m-wallet-header"><label>🚀 Rocket</label></div>
                              <strong>{fund.rocket_no}</strong>
                            </div>
                          )}
                          {fund.upay_no && (
                            <div className="m-wallet upay">
                              <div className="m-wallet-header"><label>💙 Upay</label></div>
                              <strong>{fund.upay_no}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* QR Codes */}
                    {(fund.bank_qr_url || fund.bkash_qr_url || fund.nagad_qr_url) && (
                      <div className="qr-scans-section" style={{ marginTop: '1.5rem' }}>
                        <h5 className="sub-section-title">📲 Scan to Donate</h5>
                        <div className="qr-grid-premium">
                          {fund.bank_qr_url && (
                            <div className="qr-item">
                              <div className="qr-box"><img src={fund.bank_qr_url} alt="Bank QR" /></div>
                              <label>BANK QR</label>
                            </div>
                          )}
                          {fund.bkash_qr_url && (
                            <div className="qr-item">
                              <div className="qr-box"><img src={fund.bkash_qr_url} alt="bKash QR" /></div>
                              <label>BKASH QR</label>
                            </div>
                          )}
                          {fund.nagad_qr_url && (
                            <div className="qr-item">
                              <div className="qr-box"><img src={fund.nagad_qr_url} alt="Nagad QR" /></div>
                              <label>NAGAD QR</label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-info-box">
                    <p>ℹ️ No fundraising campaign set up yet for this patient.</p>
                  </div>
                )}
              </div>
            )}

            {/* ══ TAB: MEDICAL INFO ══ */}
            {activeTab === 'info' && (
              <div className="tab-pane">

                {/* Clinical Progress Charts */}
                {(patient.chemo_total > 0 || fund) && (
                  <>
                    <h4 className="section-title">📊 Clinical Progress</h4>
                    <div className="charts-row">
                      {patient.chemo_total > 0 && (
                        <div className="chart-card">
                          <CircularProgress
                            value={patient.chemo_completed || 0}
                            total={patient.chemo_total}
                            color="#6366f1"
                            label="Chemo Progress"
                            sublabel={`${patient.chemo_completed || 0} / ${patient.chemo_total} sessions`}
                          />
                        </div>
                      )}
                      {fund && (
                        <div className="chart-card">
                          <CircularProgress
                            value={fund.collected_amount || 0}
                            total={fund.target_amount || 1}
                            color="#10b981"
                            label="Funding Status"
                            sublabel={`৳${(fund.collected_amount || 0).toLocaleString()} raised`}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Personal Info */}
                <h4 className="section-title">👤 Personal Information</h4>
                <div className="info-grid-detailed">
                  <InfoCard label="Full Name" value={patient.name} />
                  <InfoCard label="Age" value={patient.age ? `${patient.age} Years` : null} />
                  <InfoCard label="Gender" value={patient.gender} />
                  <InfoCard label="Blood Type" value={patient.blood_type} />
                  <InfoCard label="Cancer Type" value={patient.cancer_type} />
                  <InfoCard label="Current Status" value={patient.status?.replace(/-/g, ' ')} />
                  <InfoCard label="Phone / Emergency" value={patient.phone} />
                  <InfoCard label="Home Address" value={patient.address} wide />
                </div>

                {/* Academic Info */}
                <h4 className="section-title" style={{ marginTop: '2.5rem' }}>🎓 Academic Info</h4>
                <div className="info-grid-detailed">
                  <InfoCard label="Department" value={patient.dept} />
                  <InfoCard label="Batch" value={patient.batch} />
                  <InfoCard label="Session" value={patient.session} />
                </div>

                {/* Medical Info */}
                <h4 className="section-title" style={{ marginTop: '2.5rem' }}>🏥 Medical Details</h4>
                <div className="info-grid-detailed">
                  <InfoCard label="Hospital / Medical Center" value={patient.hospital} wide />
                  <InfoCard label="Consultant Doctor" value={patient.doctor_name} />
                  <InfoCard label="Admission Date" value={patient.admission_date} />
                  {patient.chemo_total > 0 && (
                    <>
                      <InfoCard label="Chemo Sessions Total" value={patient.chemo_total} />
                      <InfoCard label="Sessions Completed" value={patient.chemo_completed || 0} />
                    </>
                  )}
                </div>

                {/* Student ID Photo */}
                {patient.student_id_url && (
                  <>
                    <h4 className="section-title" style={{ marginTop: '2.5rem' }}>🪪 Student ID Verification</h4>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', display: 'inline-block' }}>
                      <img
                        src={patient.student_id_url}
                        alt="Student ID"
                        style={{ maxWidth: '320px', borderRadius: '12px', display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══ TAB: REPORTS ══ */}
            {activeTab === 'docs' && (
              <div className="tab-pane">
                <h4 className="section-title">📄 Verified Medical Documents</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.7' }}>
                  For transparency, we publish verified medical reports and prescriptions related to this patient's condition.
                </p>

                {documents.length > 0 ? (
                  <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {documents.map(doc => (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(99,102,241,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
                      >
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                          {doc.document_type === 'prescription' ? '💊' : '📄'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>
                            {doc.document_type} · {new Date(doc.created_at).toLocaleDateString('en-GB')}
                          </div>
                        </div>
                        <span style={{ color: '#6366f1', fontSize: '1.1rem', flexShrink: 0 }}>↗</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>📂</div>
                    <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Documents Yet</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Medical documents will appear here once uploaded.</p>
                  </div>
                )}
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
