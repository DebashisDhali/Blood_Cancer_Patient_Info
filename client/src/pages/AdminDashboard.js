import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        const [statsRes, patientsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/admin/patients/all`, { headers })
        ]);

        setStats(statsRes.data);
        setPatients(patientsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Patients</h3>
            <p className="stat-number">{stats.totalPatients}</p>
          </div>
          <div className="stat-card">
            <h3>Active Funds</h3>
            <p className="stat-number">{stats.activeFunds}</p>
          </div>
          <div className="stat-card">
            <h3>Total Collected</h3>
            <p className="stat-number">৳ {(stats.totalCollected || 0).toLocaleString()}</p>
          </div>
          <div className="stat-card">
            <h3>Documents</h3>
            <p className="stat-number">{stats.totalDocuments}</p>
          </div>
        </div>
      )}

      <div className="patients-section">
        <h2>All Patients</h2>
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Status</th>
              <th>Cancer Type</th>
              <th>Fund Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              const progress = patient.fund ? 
                ((patient.fund.collectedAmount / patient.fund.targetAmount) * 100).toFixed(2) : 0;
              
              return (
                <tr key={patient._id}>
                  <td>{patient.name}</td>
                  <td>{patient.age}</td>
                  <td><span className="status-badge">{patient.status}</span></td>
                  <td>{patient.cancerType}</td>
                  <td>{patient.fund ? patient.fund.status : 'No Fund'}</td>
                  <td>
                    <div className="progress-small">
                      <div className="progress-bar-small">
                        <div 
                          className="progress-fill-small" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <span>{progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
