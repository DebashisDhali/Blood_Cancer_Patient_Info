import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
// Triggering fresh build on Netlify
import PatientCard from '../components/PatientCard';
import '../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocs = async (id) => {
    setLoadingDocs(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/documents/patient/${id}`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Docs fetch error:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (selected) {
      fetchDocs(selected.id);
    }
  }, [selected]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
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

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
          <circle cx="50" cy="50" r={r} fill="transparent" stroke={color} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 50 50)" />
          <text x="50" y="55" textAnchor="middle" className="chart-text" fill="#0f172a" fontWeight="800" fontSize="18">{Math.round(pct)}%</text>
        </svg>
        <div className="chart-label">{label}</div>
      </div>
    );
  };

  const selectedFund = selected?.fund || null;

  return (
    <div className="patients-page">
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

      {loading ? (
        <div className="patients-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <>
          <div className="patients-grid">
            {filteredPatients.map(p => (
              <PatientCard 
                key={p.id} 
                patient={p} 
                fund={p.fund} 
                onClick={() => { setSelected(p); setActiveTab('fund'); }} 
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
                <div className="status-row">
                  <span className={`status-tag ${selected.status}`}>{selected.status.replace(/-/g, ' ')}</span>
                  <span className="status-tag blood">{selected.blood_type}</span>
                </div>
              </div>
              <div className="modal-nav">
                <button className={activeTab === 'fund' ? 'active' : ''} onClick={() => setActiveTab('fund')}>💰 Donation Center</button>
                <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>🏥 Medical Info</button>
                <button className={activeTab === 'docs' ? 'active' : ''} onClick={() => setActiveTab('docs')}>📄 Reports</button>
              </div>
            </div>
 
            <div className="modal-content-area">
              {activeTab === 'fund' && (
                <div className="tab-pane">
                  <h4 className="section-title">Campaign Financials</h4>
                  <div className="fund-visual-progress-box">
                    <div className="fund-progress-meta">
                      <div className="fund-main-percent">
                        {Math.min(100, ((selectedFund?.collected_amount || 0) / (selectedFund?.target_amount || 1)) * 100).toFixed(1)}%
                        <span>Funded</span>
                      </div>
                      <div className="fund-mini-stats-top">
                        <div className="fms-item"><label>Target</label><strong>৳{(selectedFund?.target_amount || 0).toLocaleString()}</strong></div>
                        <div className="fms-item"><label>Raised</label><strong style={{ color: '#10b981' }}>৳{(selectedFund?.collected_amount || 0).toLocaleString()}</strong></div>
                      </div>
                    </div>
                    <div className="fund-progress-bar-large">
                      <div className="fund-progress-fill-large" style={{ width: `${Math.min(100, ((selectedFund?.collected_amount || 0) / (selectedFund?.target_amount || 1)) * 100)}%` }}>
                        <div className="progress-glow"></div>
                      </div>
                    </div>
                  </div>

                  <div className="donation-methods-container">
                    {selectedFund?.bank_account_no && (
                      <div className="bank-card-premium">
                        <div className="bank-card-header"><span>🏛️ BANK TRANSFER</span></div>
                        <div className="bank-card-body">
                          <h3>{selectedFund.bank_name}</h3>
                          <div className="bank-acc-row"><label>A/C No</label><strong>{selectedFund.bank_account_no}</strong></div>
                          <div className="bank-acc-row"><label>Name</label><span>{selectedFund.bank_account_name}</span></div>
                        </div>
                      </div>
                    )}
                    <div className="mobile-payments-section">
                      <div className="mobile-grid-premium">
                        {selectedFund?.bkash_no && (
                          <div className="m-wallet bkash">
                            <div className="m-wallet-header"><img src="/images/bkash-logo.png" alt="bKash" className="m-logo" /><label>bKash</label></div>
                            <strong>{selectedFund.bkash_no}</strong>
                          </div>
                        )}
                        {selectedFund?.nagad_no && (
                          <div className="m-wallet nagad">
                            <div className="m-wallet-header"><img src="/images/nagad-logo.jpg" alt="Nagad" className="m-logo" /><label>Nagad</label></div>
                            <strong>{selectedFund.nagad_no}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="tab-pane">
                  <h4 className="section-title">Clinical Progress</h4>
                  <div className="charts-row">
                    <div className="chart-card">
                      <CircularProgress value={selected.chemo_completed || 0} total={selected.chemo_total || 0} color="#6366f1" label="Chemo Progress" />
                    </div>
                    {selectedFund && (
                      <div className="chart-card">
                        <CircularProgress value={selectedFund.collected_amount || 0} total={selectedFund.target_amount || 1} color="#10b981" label="Funding Status" />
                      </div>
                    )}
                  </div>
                  
                  <h4 className="section-title">Bio-Data & Records</h4>
                  <div className="info-grid-detailed">
                    <div className="info-card"><label>Department</label><span>{selected.dept || 'N/A'}</span></div>
                    <div className="info-card"><label>Batch</label><span>{selected.batch || 'N/A'}</span></div>
                    <div className="info-card"><label>Session</label><span>{selected.session || 'N/A'}</span></div>
                    <div className="info-card"><label>Age</label><span>{selected.age} Years</span></div>
                    <div className="info-card"><label>Gender</label><span>{selected.gender}</span></div>
                    <div className="info-card"><label>Consultant</label><span>{selected.doctor_name || 'N/A'}</span></div>
                    <div className="info-card" style={{ gridColumn: 'span 2' }}><label>Emergency Contact</label><span>{selected.phone || 'N/A'}</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="tab-pane">
                  <h4 className="section-title">Medical Reports & Docs</h4>
                  {loadingDocs ? <p>Loading documents...</p> : (
                    <div className="docs-list-simple">
                      {documents.length > 0 ? documents.map(doc => (
                        <div key={doc.id} onClick={() => setSelectedDoc(doc)} className="doc-item-modal" style={{ cursor: 'pointer' }}>
                          <span className="doc-icon">📄</span>
                          <div className="doc-meta">
                            <strong>{doc.title}</strong>
                            <small>{new Date(doc.created_at).toLocaleDateString()}</small>
                          </div>
                        </div>
                      )) : <p>No documents available.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="doc-viewer-backdrop" onClick={() => setSelectedDoc(null)}>
          <div className="doc-viewer-container" onClick={e => e.stopPropagation()}>
            <div className="doc-viewer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{selectedDoc.document_type === 'prescription' ? '💊' : '📄'}</span>
                <div>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>{selectedDoc.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>{selectedDoc.document_type}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href={selectedDoc.file_url} download className="btn-share-big" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#f1f5f9', color: '#0f172a', boxShadow: 'none' }}>Download</a>
                <button className="btn-close-viewer" onClick={() => setSelectedDoc(null)}>✕</button>
              </div>
            </div>
            <div className="doc-viewer-content">
              {selectedDoc.file_url.split(/[?#]/)[0].match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img 
                  src={selectedDoc.file_url} 
                  alt={selectedDoc.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Load+Failed';
                  }}
                />
              ) : selectedDoc.file_url.split(/[?#]/)[0].match(/\.pdf$/i) ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem' }}>📄</div>
                    <h3>PDF Document</h3>
                    <p>For the best experience, open the PDF in a new tab.</p>
                    <a href={selectedDoc.file_url} target="_blank" rel="noreferrer" className="btn-share-big">Open Full Document</a>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
                  <h3>Preview Unavailable</h3>
                  <p>This file type cannot be previewed. Please download it.</p>
                  <a href={selectedDoc.file_url} className="btn-share-big" style={{ marginTop: '1.5rem' }}>Download File</a>
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
