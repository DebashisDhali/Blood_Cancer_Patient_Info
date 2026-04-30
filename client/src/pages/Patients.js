import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PatientCard from '../components/PatientCard';
import '../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
                onClick={() => { setSelected(p); setActiveTab('info'); }} 
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
                <button className={activeTab === 'info' ? 'active' : ''} onClick={() => setActiveTab('info')}>🏥 Medical</button>
                <button className={activeTab === 'fund' ? 'active' : ''} onClick={() => setActiveTab('fund')}>💰 Fundraising</button>
              </div>
            </div>
 
            <div className="modal-content-area">
              {activeTab === 'info' ? (
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
                    <div className="info-card"><label>Admission</label><span>{selected.admission_date || 'N/A'}</span></div>
                    <div className="info-card"><label>Consultant</label><span>{selected.doctor_name || 'N/A'}</span></div>
                    <div className="info-card"><label>Cancer Stage</label><span>{selected.cancer_type}</span></div>
                    <div className="info-card" style={{ gridColumn: 'span 2' }}><label>Home Address</label><span>{selected.address || 'Not Provided'}</span></div>
                    <div className="info-card"><label>Emergency Contact</label><span>{selected.phone || 'N/A'}</span></div>
                  </div>
                </div>
              ) : (
                <div className="tab-pane">
                  <div className="fund-hero">
                    <div className="fund-stat">
                      <span className="fund-amount-label">Target Amount</span>
                      <strong className="fund-amount-value">৳{(selectedFund?.target_amount || 0).toLocaleString()}</strong>
                    </div>
                    <div className="fund-stat" style={{ textAlign: 'right' }}>
                      <span className="fund-amount-label">Raised So Far</span>
                      <strong className="fund-amount-value" style={{ color: '#10b981' }}>৳{(selectedFund?.collected_amount || 0).toLocaleString()}</strong>
                    </div>
                  </div>
 
                  {selectedFund?.description && (
                    <div className="fund-story-box">
                      <h4 className="section-title">Campaign Story</h4>
                      <p className="fund-story-text">{selectedFund.description}</p>
                    </div>
                  )}
  
                  <h4 className="section-title">Verified Payment Methods</h4>
                  <div className="payment-grid">
                    <div className="payment-methods-list">
                      {selectedFund?.bank_account_no && (
                        <div className="bank-card">
                          <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em' }}>DIRECT BANK TRANSFER</p>
                          <p style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.75rem', color: '#0f172a' }}>{selectedFund.bank_name}</p>
                          <p style={{ fontSize: '1.1rem', margin: '0.4rem 0', color: '#334155', fontWeight: '600' }}>{selectedFund.bank_account_no}</p>
                          <p style={{ color: '#64748b', fontWeight: '500' }}>{selectedFund.bank_account_name}</p>
                        </div>
                      )}
                      <div className="mobile-grid">
                        {selectedFund?.bkash_no && <div className="mobile-card"><label>bKash</label><strong>{selectedFund.bkash_no}</strong></div>}
                        {selectedFund?.nagad_no && <div className="mobile-card"><label>Nagad</label><strong>{selectedFund.nagad_no}</strong></div>}
                      </div>
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
