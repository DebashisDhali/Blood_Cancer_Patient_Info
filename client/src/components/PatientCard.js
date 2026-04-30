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
    : null;

  return (
    <div className="pcard" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
       {/* Photo */}
       <div className="pcard-photo-wrap">
         {patient.photo_url
           ? <img src={patient.photo_url} alt={patient.name} className="pcard-photo" loading="lazy" />
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
         <p className="pcard-cancer">{patient.cancer_type || 'Cancer'}</p>
 
         <div className="pcard-details">
           {patient.age && <span className="pcard-tag">🎂 {patient.age} yrs</span>}
           {patient.blood_type && <span className="pcard-tag">🩸 {patient.blood_type}</span>}
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
 
         <div className="pcard-cta-overlay">
           <span>Click to View Details</span>
         </div>
       </div>
       <button 
         className="pcard-share-btn" 
         title="Share Profile"
         onClick={(e) => {
           e.stopPropagation();
           const url = `${window.location.origin}/patients/${patient.id}`;
           if (navigator.share) {
             navigator.share({ title: `Support ${patient.name}`, url });
           } else {
             navigator.clipboard.writeText(url);
             alert('Link copied to clipboard!');
           }
         }}
       >
         🔗 Share
       </button>
     </div>
  );
});

export default PatientCard;
