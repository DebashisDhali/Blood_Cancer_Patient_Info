import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PatientCard from '../components/PatientCard';
import DonationForm from '../components/DonationForm';
import '../styles/Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [funds, setFunds] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/patients`);
        setPatients(response.data);
        
        // Fetch funds for each patient
        const fundsData = {};
        for (const patient of response.data) {
          try {
            const fundRes = await axios.get(
              `${process.env.REACT_APP_API_URL}/funds/patient/${patient._id}`
            );
            fundsData[patient._id] = fundRes.data;
          } catch (error) {
            console.log('No fund for patient:', patient._id);
          }
        }
        setFunds(fundsData);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <div className="loading">Loading patients...</div>;

  return (
    <div className="patients-page">
      <h1>🩸 Blood Cancer Patients</h1>
      <p className="subtitle">Help save lives. Every support counts.</p>

      <div className="patients-container">
        <div className="patients-grid">
          {patients.map((patient) => (
            <div 
              key={patient._id}
              className={`patient-item ${selectedPatient === patient._id ? 'selected' : ''}`}
              onClick={() => setSelectedPatient(patient._id)}
            >
              <PatientCard patientId={patient._id} />
            </div>
          ))}
        </div>

        {selectedPatient && funds[selectedPatient] && (
          <div className="donation-panel">
            <button 
              className="close-btn"
              onClick={() => setSelectedPatient(null)}
            >
              ✕
            </button>
            <DonationForm 
              patientName={patients.find(p => p._id === selectedPatient)?.name}
              targetAmount={funds[selectedPatient]?.targetAmount}
              collectedAmount={funds[selectedPatient]?.collectedAmount}
            />
          </div>
        )}
      </div>

      {patients.length === 0 && (
        <div className="no-patients">
          <p>No patients found. Please check back later.</p>
        </div>
      )}

      <div className="info-banner">
        <h3>💡 How It Works</h3>
        <p>Click on any patient to see their story and learn how to support them with donations.</p>
      </div>
    </div>
  );
};

export default Patients;
