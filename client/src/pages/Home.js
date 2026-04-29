import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/Home.css';

const stats = [
  { icon: '🧬', value: '100+', label: 'Patients Supported' },
  { icon: '💰', value: '৳50L+', label: 'Funds Raised' },
  { icon: '🏥', value: '15+', label: 'Hospitals Covered' },
  { icon: '❤️', value: '500+', label: 'Donors & Supporters' },
];

const features = [
  { icon: '📋', title: 'Patient Profiles', desc: 'Detailed profiles with medical history, treatment progress, and personal story for each patient.' },
  { icon: '💳', title: 'Fundraising Tracker', desc: 'Real-time fundraising progress with transparent goal tracking and donor information.' },
  { icon: '📄', title: 'Document Archive', desc: 'Securely organized medical reports, prescriptions, and lab results.' },
  { icon: '🔒', title: 'Private & Secure', desc: 'Sensitive patient data is encrypted. Personal contacts shown only to authorized admins.' },
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge">🩸 Jahangirnagar University Cancer Support Initiative</div>
          <h1>Fighting Blood Cancer<br /><span className="hero-highlight">Together</span></h1>
          <p className="hero-desc">
            A platform connecting blood cancer patients, supporters, and donors.
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
          <div className="hero-icon-wrap">🩸</div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div className="stat-item" key={i}>
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header-center">
          <h2>Everything You Need</h2>
          <p>A complete platform built to support blood cancer patients and their families</p>
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
          <p>Browse our patient profiles and find out how you can help today.</p>
          <button className="btn-cta" onClick={() => navigate('/patients')}>
            View All Patients →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
