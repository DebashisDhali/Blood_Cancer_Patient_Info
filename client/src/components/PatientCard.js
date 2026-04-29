import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/PatientCard.css';

const PatientCard = ({ patientId }) => {
  const [patient, setPatient] = useState(null);
  const [fund, setFund] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandDetails, setExpandDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, fundRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/patients/${patientId}`),
          axios.get(`${process.env.REACT_APP_API_URL}/funds/patient/${patientId}`)
        ]);
        
        setPatient(patientRes.data);
        setFund(fundRes.data);

        // Fetch photo
        try {
          const photoRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/patients/${patientId}/photo`,
            { responseType: 'blob' }
          );
          const photoUrl = URL.createObjectURL(photoRes.data);
          setPhoto(photoUrl);
        } catch (error) {
          console.log('No photo available');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) return <div className="loading-card">Loading...</div>;

  if (!patient) return <div className="error-card">Patient not found</div>;

  const progress = fund ? ((( fund.collected_amount || 0) / (fund.target_amount || 1)) * 100).toFixed(2) : 0;

  return (
    <div className="patient-card">
      {photo && <img src={photo} alt={patient.name} className="patient-photo" />}
      
      <div className="patient-info">
        <h2>{patient.name}</h2>
        <div className="basic-info">
          <p><span className="label">Age:</span> {patient.age}</p>
          <p><span className="label">Blood Type:</span> {patient.blood_type}</p>
          <p><span className="label">Cancer Type:</span> {patient.cancer_type}</p>
          <p><span className="label">Status:</span> <span className="status">{patient.status}</span></p>
        </div>
        
        {patient.chemo_sessions && (
          <div className="chemo-info">
            <p><strong>Chemotherapy Progress:</strong></p>
            <p>{patient.chemo_sessions.completed} / {patient.chemo_sessions.total} sessions completed</p>
          </div>
        )}
        
        {patient.doctor_name && (
          <div className="doctor-info">
            <p><strong>Doctor:</strong> {patient.doctor_name}</p>
            <p><strong>Hospital:</strong> {patient.hospital}</p>
          </div>
        )}

        <button 
          className="expand-btn"
          onClick={() => setExpandDetails(!expandDetails)}
        >
          {expandDetails ? '📖 Hide Details' : '📖 More Details'}
        </button>

        {expandDetails && (
          <div className="expanded-details">
            <p><strong>Emergency Contact:</strong> {patient.emergency_contact_name} ({patient.emergency_contact_relation})</p>
            {patient.emergency_contact_phone && (
              <p><strong>Contact:</strong> {patient.emergency_contact_phone}</p>
            )}
          </div>
        )}
      </div>

      {fund && (
        <div className="fund-info">
          <h3>💰 Support Needed</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="fund-details">
            <strong>৳{(fund.collected_amount || 0).toLocaleString()}</strong> of <strong>৳{(fund.target_amount || 0).toLocaleString()}</strong> collected ({progress}%)
          </p>
          {fund.description && (
            <p className="fund-description">{fund.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientCard;
