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
            <div className="tab-pane" style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '2.5rem' }}>
              <h4 className="section-title">Patient Profile</h4>
              <div className="info-grid-detailed">
                <div className="info-card"><label>Department</label><span>{patient.dept || 'N/A'}</span></div>
                <div className="info-card"><label>Batch</label><span>{patient.batch || 'N/A'}</span></div>
                <div className="info-card"><label>Age</label><span>{patient.age} Years</span></div>
                <div className="info-card"><label>Gender</label><span>{patient.gender}</span></div>
                <div className="info-card"><label>Blood Type</label><span>{patient.blood_type}</span></div>
                <div className="info-card" style={{ gridColumn: 'span 2' }}><label>Emergency Contact</label><span>{patient.phone || 'N/A'}</span></div>
              </div>
            </div>

            {activeTab === 'fund' && <DonationCenter fund={fund} />}

            {activeTab === 'info' && (
              <div className="tab-pane">
                <h4 className="section-title">Admission & Clinical</h4>
                <div className="info-grid-detailed">
                  <div className="info-card"><label>Session</label><span>{patient.session || 'N/A'}</span></div>
                  <div className="info-card"><label>Consultant</label><span>{patient.doctor_name || 'N/A'}</span></div>
                  <div className="info-card" style={{ gridColumn: 'span 2' }}><label>Medical Center</label><span>{patient.hospital || 'N/A'}</span></div>
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
