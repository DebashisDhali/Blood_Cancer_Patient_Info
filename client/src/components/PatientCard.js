import React, { memo } from 'react';
import '../styles/PatientCard.css';
import { buildPatientPath } from '../utils/patientUrl';

const statusLabel = (s) => (s || 'In Treatment').replace(/-/g, ' ');
const statusClass = (s) => {
  if (s === 'recovered') return 'badge-success';
  if (s === 'critical') return 'badge-danger';
  return 'badge-primary';
};

const PatientCard = memo(({ patient, fund, onClick }) => {
  const patientPath = buildPatientPath(patient);
  const progress = fund
    ? Math.min(100, ((fund.collected_amount / fund.target_amount) * 100)).toFixed(0)
    : 0;

  return (
    <div className="pcard-premium" onClick={onClick}>
      <div className="pcard-header-wrap">
        <div className="pcard-image-box">
          {patient.photo_url ? (
            <img src={patient.photo_url} alt={patient.name} className="pcard-img" loading="lazy" />
          ) : (
            <div className="pcard-img-placeholder">👤</div>
          )}
          <div className={`pcard-glass-badge ${statusClass(patient.status)}`}>
            {statusLabel(patient.status)}
          </div>
          <button 
            className="pcard-share-float" 
            title="Share Profile"
            onClick={(e) => {
              e.stopPropagation();
              const url = `${window.location.origin}${patientPath}`;
              if (navigator.share) {
                navigator.share({ title: `Support ${patient.name}`, url });
              } else {
                navigator.clipboard.writeText(url);
                alert('Profile link copied!');
              }
            }}
          >
            🔗
          </button>
        </div>
      </div>

      <div className="pcard-details-wrap">
        <div className="pcard-top-info">
          <span className="pcard-blood-type">{patient.blood_type}</span>
          <h3 className="pcard-title">{patient.name}</h3>
          <p className="pcard-subtitle">{patient.cancer_type}</p>
        </div>

        <div className="pcard-stats-row">
          <div className="pcard-mini-stat">
            <label>Age</label>
            <span>{patient.age}y</span>
          </div>
          <div className="pcard-mini-stat">
            <label>Batch</label>
            <span>{patient.batch || 'JU'}</span>
          </div>
        </div>

        {fund ? (
          <div className="pcard-funding-zone">
            <div className="pcard-progress-container">
              <div className="pcard-progress-fill-premium" style={{ width: `${progress}%` }} />
            </div>
            <div className="pcard-funding-labels">
              <span className="pcard-percent">{progress}% Funded</span>
              <span className="pcard-target">৳{(fund.target_amount || 0).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="pcard-no-campaign">No active fund campaign</div>
        )}
      </div>

      <div className="pcard-action-bar">
        <span>View Full Profile</span>
        <div className="pcard-arrow-icon">→</div>
      </div>
    </div>
  );
});

export default PatientCard;
