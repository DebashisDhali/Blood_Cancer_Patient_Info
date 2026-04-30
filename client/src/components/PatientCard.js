import React, { memo } from 'react';
import '../styles/PatientCard.css';

const statusLabel = (s) => (s || 'In Treatment').replace(/-/g, ' ');
const statusClass = (s) => {
  if (s === 'recovered') return 'badge-success';
  if (s === 'critical') return 'badge-danger';
  return 'badge-primary';
};

const PatientCard = memo(({ patient, fund, onClick }) => {
  const progress = fund
    ? Math.min(100, ((fund.collected_amount / fund.target_amount) * 100)).toFixed(1)
    : 0;

  return (
    <div className="pcard" onClick={onClick} role="button" tabIndex={0}>
       <div className="pcard-photo-wrap">
         {patient.photo_url ? (
           <img src={patient.photo_url} alt={patient.name} className="pcard-photo" loading="lazy" />
         ) : (
           <div className="pcard-photo-placeholder">👤</div>
         )}
         <div className={`pcard-status-badge ${statusClass(patient.status)}`}>
           {statusLabel(patient.status)}
         </div>
       </div>
 
       <div className="pcard-body">
         <div className="pcard-main">
           <h3 className="pcard-name">{patient.name}</h3>
           <p className="pcard-type">{patient.cancer_type}</p>
         </div>

         <div className="pcard-stats">
           <div className="pcard-stat-item">
             <span className="pcard-stat-label">Blood</span>
             <span className="pcard-stat-value">{patient.blood_type}</span>
           </div>
           <div className="pcard-stat-item">
             <span className="pcard-stat-label">Age</span>
             <span className="pcard-stat-value">{patient.age}y</span>
           </div>
         </div>

         {fund ? (
           <div className="pcard-fund-section">
             <div className="pcard-progress-track">
               <div className="pcard-progress-bar" style={{ width: `${progress}%` }} />
             </div>
             <div className="pcard-fund-meta">
               <span className="pcard-fund-percent">{progress}%</span>
               <span className="pcard-fund-target">৳{(fund.target_amount || 0).toLocaleString()}</span>
             </div>
           </div>
         ) : (
           <div className="pcard-no-fund">No active campaign</div>
         )}
       </div>
       
       <div className="pcard-footer">
         <span>View Details</span>
         <span className="arrow">→</span>
       </div>
     </div>
  );
});

export default PatientCard;
