import React, { useState, useEffect, useMemo } from 'react';
import { patientService } from '../services/patientService';
import { documentService } from '../services/documentService';
import PatientCard from '../components/PatientCard';
import DocumentViewer from '../components/shared/DocumentViewer';
import '../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('fund');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await patientService.getAll();
        setPatients(data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (selected) {
      setLoadingDocs(true);
      documentService.getByPatientId(selected.id)
        .then(data => setDocuments(data))
        .catch(err => console.error('Docs fetch error:', err))
        .finally(() => setLoadingDocs(false));
    } else {
      setDocuments([]);
    }
  }, [selected]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cancer_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filterStatus]);

  const CircularProgress = ({ value, total, color, label }) => {
    const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
    const r = 40;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <div className="chart-item">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
          <text x="50" y="55" textAnchor="middle" fill="#0f172a" fontWeight="800" fontSize="18">{Math.round(pct)}%</text>
        </svg>
        <div className="chart-label">{label}</div>
      </div>
    );
  };

  const fund = selected?.fund;
  const progress = fund ? Math.min(100, ((fund.collected_amount || 0) / (fund.target_amount || 1)) * 100) : 0;

  const openModal = (patient) => {
    setSelected(patient);
    setActiveTab('fund');
    setDocuments([]);
  };

  const closeModal = () => {
    setSelected(null);
    setSelectedDoc(null);
    setActiveTab('fund');
  };

  return (
    <div className="patients-page">
      {/* Header */}
      <div className="patients-header">
        <h1>🎗️ Support Our Heroes</h1>
        <p>Every small contribution can change a life. Search and find patients to support.</p>
        <div className="search-filter-wrap">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or cancer type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-tabs">
            {['all', 'in-treatment', 'critical', 'recovered'].map(s => (
              <button
                key={s}
                className={filterStatus === s ? 'active' : ''}
                onClick={() => setFilterStatus(s)}
              >
                {s.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="patients-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <>
          <div className="patients-grid">
            {filteredPatients.map(p => (
              <PatientCard
                key={p.id}
                patient={p}
                fund={p.fund}
                onClick={() => openModal(p)}
              />
            ))}
          </div>
          {filteredPatients.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No Patients Found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </>
      )}

      {/* Patient Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="patient-modal wide" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>

            {/* Left Sidebar - Photo + Name only */}
            <div className="modal-sidebar">
              <div className="modal-photo-box">
                {selected.photo_url
                  ? <img src={selected.photo_url} alt={selected.name} />
                  : <div className="photo-placeholder">👤</div>}
              </div>
              <div className="sidebar-info">
                <h2>{selected.name}</h2>
                <div className="status-row">
                  <span className={`status-tag ${selected.status}`}>{selected.status.replace(/-/g, ' ')}</span>
                  <span className="status-tag blood">{selected.blood_type}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>{selected.cancer_type}</p>
              </div>
            </div>

            {/* Sticky Tab Navigation */}
            <div className="modal-tab-bar">
              <button
                className={activeTab === 'fund' ? 'active' : ''}
                onClick={() => setActiveTab('fund')}
              >
                💰 Donation
              </button>
              <button
                className={activeTab === 'info' ? 'active' : ''}
                onClick={() => setActiveTab('info')}
              >
                🏥 Medical Info
              </button>
              <button
                className={activeTab === 'docs' ? 'active' : ''}
                onClick={() => setActiveTab('docs')}
              >
                📄 Reports
              </button>
              <a
                href={`/patients/${selected.id}`}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, padding: '0.85rem 0.5rem', borderRadius: '14px', border: 'none', background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
              >
                🔗 Full Page
              </a>
            </div>

            {/* Scrollable Content Area */}
            <div className="modal-content-scroll">
              <div className="modal-content-area">

              {/* ── TAB: DONATION CENTER ── */}
              {activeTab === 'fund' && (
                <div className="tab-pane">
                  <h4 className="section-title">💰 Campaign Financials</h4>

                  {fund ? (
                    <>
                      {/* Progress Bar */}
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
                          </div>
                        </div>
                        <div className="fund-progress-bar-large">
                          <div className="fund-progress-fill-large" style={{ width: `${progress}%` }}>
                            <div className="progress-glow"></div>
                          </div>
                        </div>
                        <p className="fund-support-hint">
                          🙏 {(fund.target_amount - fund.collected_amount) > 0
                            ? `Only ৳${(fund.target_amount - fund.collected_amount).toLocaleString()} more needed!`
                            : 'Target reached! Additional support is still welcome.'}
                        </p>
                      </div>

                      {/* Bank Details */}
                      {(fund.bank_account_no || fund.bank_name) ? (
                        <div className="bank-card-premium" style={{ marginTop: '1.5rem' }}>
                          <div className="bank-card-header">
                            <span>🏛️ DIRECT BANK TRANSFER</span>
                          </div>
                          <div className="bank-card-body">
                            <h3>{fund.bank_name || 'Bank Details'}</h3>
                            {fund.bank_account_no && (
                              <div className="bank-acc-row"><label>Account No</label><strong>{fund.bank_account_no}</strong></div>
                            )}
                            {fund.bank_account_name && (
                              <div className="bank-acc-row"><label>Account Name</label><span>{fund.bank_account_name}</span></div>
                            )}
                            {fund.bank_branch && (
                              <div className="bank-acc-row"><label>Branch</label><span>{fund.bank_branch}</span></div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="no-info-box" style={{ marginTop: '1.5rem' }}>
                          <p>ℹ️ No bank account details provided.</p>
                        </div>
                      )}

                      {/* Mobile Wallets */}
                      {(fund.bkash_no || fund.nagad_no) && (
                        <div className="mobile-payments-section" style={{ marginTop: '1.5rem' }}>
                          <h5 className="sub-section-title">Mobile Wallets</h5>
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
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="no-info-box">
                      <p>ℹ️ No fundraising campaign set up for this patient yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: MEDICAL INFO ── */}
              {activeTab === 'info' && (
                <div className="tab-pane">
                  {/* Chemo Progress Chart */}
                  {(selected.chemo_total > 0) && (
                    <>
                      <h4 className="section-title">📊 Clinical Progress</h4>
                      <div className="charts-row">
                        <div className="chart-card">
                          <CircularProgress
                            value={selected.chemo_completed || 0}
                            total={selected.chemo_total || 0}
                            color="#6366f1"
                            label="Chemo Progress"
                          />
                        </div>
                        {fund && (
                          <div className="chart-card">
                            <CircularProgress
                              value={fund.collected_amount || 0}
                              total={fund.target_amount || 1}
                              color="#10b981"
                              label="Funding Status"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Full Bio-Data */}
                  <h4 className="section-title" style={{ marginTop: '1.5rem' }}>🏥 Patient Bio-Data</h4>
                  <div className="info-grid-detailed">
                    <div className="info-card"><label>Department</label><span>{selected.dept || 'N/A'}</span></div>
                    <div className="info-card"><label>Batch</label><span>{selected.batch || 'N/A'}</span></div>
                    <div className="info-card"><label>Session</label><span>{selected.session || 'N/A'}</span></div>
                    <div className="info-card"><label>Age</label><span>{selected.age} Years</span></div>
                    <div className="info-card"><label>Gender</label><span>{selected.gender}</span></div>
                    <div className="info-card"><label>Blood Type</label><span>{selected.blood_type}</span></div>
                    <div className="info-card"><label>Admission Date</label><span>{selected.admission_date || 'N/A'}</span></div>
                    <div className="info-card"><label>Medical Center</label><span>{selected.hospital || 'N/A'}</span></div>
                    <div className="info-card"><label>Consultant</label><span>{selected.doctor_name || 'N/A'}</span></div>
                    <div className="info-card"><label>Cancer Type</label><span>{selected.cancer_type}</span></div>
                    <div className="info-card" style={{ gridColumn: 'span 2' }}>
                      <label>Home Address</label><span>{selected.address || 'Not Provided'}</span>
                    </div>
                    <div className="info-card"><label>Emergency Contact</label><span>{selected.phone || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {/* ── TAB: REPORTS / DOCUMENTS ── */}
              {activeTab === 'docs' && (
                <div className="tab-pane">
                  <h4 className="section-title">📄 Verified Medical Documents</h4>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    Click any document to preview or download it.
                  </p>
                  {loadingDocs ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      <div className="spinner" style={{ margin: '0 auto 1rem' }} />
                      Loading documents...
                    </div>
                  ) : documents.length > 0 ? (
                    <div className="docs-list-simple">
                      {documents.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          className="doc-item-modal"
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="doc-icon">{doc.document_type === 'prescription' ? '💊' : '📄'}</span>
                          <div className="doc-meta">
                            <strong>{doc.title}</strong>
                            <small>{doc.document_type} · {new Date(doc.created_at).toLocaleDateString()}</small>
                          </div>
                          <span style={{ color: '#6366f1', fontSize: '1.1rem', marginLeft: 'auto' }}>↗</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0', color: '#94a3b8' }}>
                      No medical documents uploaded yet.
                    </div>
                  )}
                </div>
              )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview */}
      <DocumentViewer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
    </div>
  );
};

export default Patients;
