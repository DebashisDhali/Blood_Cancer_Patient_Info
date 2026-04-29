import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        <h1>Blood Cancer Patient Support Platform</h1>
        <p>Connecting patients, supporters, and donors in the fight against blood cancer</p>
        <div className="hero-buttons">
          <Link to="/patients" className="btn btn-primary">View Patients</Link>
          <Link to="/login" className="btn btn-secondary">Admin Portal</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature">
          <h3>📋 Patient Information</h3>
          <p>Access detailed medical information and treatment progress</p>
        </div>
        <div className="feature">
          <h3>💰 Fundraising</h3>
          <p>Support patients with medical expenses through secure donations</p>
        </div>
        <div className="feature">
          <h3>📄 Document Management</h3>
          <p>Organize and track all medical documents and reports</p>
        </div>
        <div className="feature">
          <h3>🔒 Secure & Private</h3>
          <p>All patient information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
