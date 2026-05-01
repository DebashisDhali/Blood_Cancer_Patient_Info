import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { patientService } from '../services/patientService';
import '../styles/Home.css';

const features = [
  { icon: '📋', title: 'Patient Profiles', desc: 'Detailed profiles with medical history, treatment progress, and personal story for each patient.' },
  { icon: '💳', title: 'Fundraising Tracker', desc: 'Real-time fundraising progress with transparent goal tracking and donor information.' },
  { icon: '📄', title: 'Document Archive', desc: 'Securely organized medical reports, prescriptions, and lab results.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'Sensitive patient data is encrypted. Personal contacts shown only to authorized admins.' },
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [globalStats, setGlobalStats] = useState({ totalPatients: 0, totalChemo: 0, totalCollected: 0, impactFactor: 0 });
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, patientsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/stats/global`),
          patientService.getAll()
        ]);
        setGlobalStats(statsRes.data);
        // Get top 3 recent patients
        setRecentPatients(patientsRes.slice(0, 3));
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">🎗️ Jahangirnagar University Cancer Support Initiative</div>
          <h1>Fighting Cancer<br /><span className="hero-highlight">Together</span></h1>
          <p className="hero-desc">
            A complete platform built to support cancer patients and their families.
            Every contribution — big or small — makes a life-saving difference.
          </p>
          <div className="hero-actions">
            <Link to="/patients" className="btn-hero-primary">View Patients →</Link>
            {user
              ? <Link to="/admin" className="btn-hero-secondary">Go to Dashboard</Link>
              : <Link to="/login" className="btn-hero-secondary">Admin Portal</Link>
            }
          </div>
        </div>
        <div className="hero-visual">
          <div className="pulse-ring r1" />
          <div className="pulse-ring r2" />
          <div className="pulse-ring r3" />
          <div className="hero-icon-wrap">🎗️</div>
        </div>
      </section>

      {/* Donation Impact Center (Graph) */}
      <section className="impact-center">
        <div className="section-header-center">
          <h2>Donation Impact Center</h2>
          <p>Transparency in every taka. See how our community is changing lives.</p>
        </div>

        <div className="impact-container">
          <div className="impact-stats">
            <div className="impact-card">
              <h3>৳{globalStats.totalCollected.toLocaleString()}</h3>
              <p>Total Contribution</p>
            </div>
            <div className="impact-card highlight">
              <h3>{globalStats.totalPatients}</h3>
              <p>Lives Impacted</p>
            </div>
            <div className="impact-card">
              <h3>{globalStats.totalChemo}</h3>
              <p>Chemos Funded</p>
            </div>
          </div>

          <div className="impact-chart-box" style={{ background: 'transparent', padding: 0, border: 'none', boxShadow: 'none' }}>
            <div className="chart-header" style={{ marginBottom: '1.5rem' }}>
              <h4>Recently Added Patients</h4>
              <Link to="/patients" className="chart-legend" style={{ textDecoration: 'none', color: '#6366f1', fontWeight: '700' }}>View All →</Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentPatients.map(p => (
                <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'white', padding: '1.25rem', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(5px)'; e.currentTarget.style.borderColor = '#6366f1'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                    {p.photo_url ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', color: '#0f172a' }}>{p.name}</h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{p.cancer_type}</p>
                  </div>
                  {p.fund && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#10b981' }}>{Math.min(100, (p.fund.collected_amount / p.fund.target_amount) * 100).toFixed(1)}%</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Funded</div>
                    </div>
                  )}
                  <div style={{ color: '#cbd5e1' }}>❯</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header-center">
          <h2>Platform Excellence</h2>
          <p>Built with transparency and care for JU community</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Every second counts. Join us in the fight against cancer today.</p>
          <button className="btn-cta" onClick={() => navigate('/patients')}>
            Become a Donor Today →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
