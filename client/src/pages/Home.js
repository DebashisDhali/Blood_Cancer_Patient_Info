import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
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

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/stats/global`);
        setGlobalStats(res.data);
      } catch (err) {
        console.error('Stats fetch error:', err);
      }
    };
    fetchGlobalStats();
  }, []);

  // Custom SVG Bar Chart Data
  const chartData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 70 },
    { label: 'Mar', value: 60 },
    { label: 'Apr', value: 90 },
    { label: 'May', value: 120 },
    { label: 'Jun', value: 150 },
  ];

  const maxVal = Math.max(...chartData.map(d => d.value));

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

          <div className="impact-chart-box">
            <div className="chart-header">
              <h4>Monthly Funding Growth</h4>
              <div className="chart-legend"><span></span> Real-time Impact</div>
            </div>
            <div className="chart-svg-wrap">
              <svg viewBox="0 0 600 250" className="impact-svg">
                {/* Grid Lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="40" y1={200 - (i * 40)} x2="580" y2={200 - (i * 40)} stroke="#e2e8f0" strokeDasharray="5,5" />
                ))}
                {/* Bars */}
                {chartData.map((d, i) => {
                  const barHeight = (d.value / maxVal) * 150;
                  const xPos = 60 + (i * 90);
                  return (
                    <g key={i} className="bar-group">
                      <rect 
                        x={xPos} 
                        y={200 - barHeight} 
                        width="50" 
                        height={barHeight} 
                        rx="10" 
                        fill="url(#barGradient)"
                        className="impact-bar"
                      >
                        <animate attributeName="height" from="0" to={barHeight} dur="1s" fill="freeze" />
                        <animate attributeName="y" from="200" to={200 - barHeight} dur="1s" fill="freeze" />
                      </rect>
                      <text x={xPos + 25} y="230" textAnchor="middle" className="chart-axis-text">{d.label}</text>
                      <text x={xPos + 25} y={190 - barHeight} textAnchor="middle" className="chart-value-text">{d.value}%</text>
                    </g>
                  );
                })}
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
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
