import React from 'react';
import '../styles/PatientCard.css';

const statusLabel = (s) => (s || 'In Treatment').replace(/-/g, ' ');
const statusClass = (s) => {
  if (s === 'recovered') return 'badge-success';
  if (s === 'critical') return 'badge-danger';
  return 'badge-primary';
};

const PatientCard = ({ patient, fund, onClick }) => {
  const progress = fund
    ? Math.min(100, ((fund.collected_amount / fund.target_amount) * 100)).toFixed(1)
    : null;

  return (
    <div className="pcard" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      {/* Photo */}
      <div className="pcard-photo-wrap">
        {patient.photo_url
          ? <img src={patient.photo_url} alt={patient.name} className="pcard-photo" />
          : (
            <div className="pcard-photo-placeholder">
              <span>👤</span>
            </div>
          )
        }
        <span className={`pcard-badge ${statusClass(patient.status)}`}>{statusLabel(patient.status)}</span>
      </div>

      {/* Info */}
      <div className="pcard-body">
        <h3 className="pcard-name">{patient.name}</h3>
        <p className="pcard-cancer">{patient.cancer_type || 'Blood Cancer'}</p>

        <div className="pcard-details">
          {patient.age && <span className="pcard-tag">🎂 {patient.age} yrs</span>}
          {patient.blood_type && <span className="pcard-tag">🩸 {patient.blood_type}</span>}
          {patient.hospital && <span className="pcard-tag">🏥 {patient.hospital}</span>}
        </div>

        {/* Progress */}
        {fund && progress !== null ? (
          <div className="pcard-fund">
            <div className="pcard-progress-bar">
              <div className="pcard-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="pcard-fund-info">
              <span className="pcard-fund-pct">{progress}% funded</span>
              <span className="pcard-fund-amt">৳{(fund.target_amount || 0).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="pcard-no-fund">No campaign yet</div>
        )}

        <div className="pcard-cta">View Details →</div>
      </div>
    </div>
  );
};

export default PatientCard;
