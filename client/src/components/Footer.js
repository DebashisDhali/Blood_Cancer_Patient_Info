import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">🎗️</div>
          <h3>Blood Cancer Support</h3>
          <p>A compassionate platform dedicated to helping blood cancer patients receive the support they deserve.</p>
          <div className="footer-socials">
            <a href="mailto:dhalisurjo30@gmail.com" title="Email Developer">✉️</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">🏠 Home</Link></li>
            <li><Link to="/patients">🎗️ Patient Directory</Link></li>
            <li><Link to="/login">🔐 Admin Login</Link></li>
          </ul>
        </div>

        {/* Contact / Developer */}
        <div className="footer-col">
          <h4>Developer Contact</h4>
          <ul>
            <li>
              <a href="mailto:dhalisurjo30@gmail.com">
                📧 dhalisurjo30@gmail.com
              </a>
            </li>
            <li>
              <span>🛠️ For bug reports &amp; feature requests</span>
            </li>
            <li>
              <span>💡 Open to collaboration</span>
            </li>
          </ul>
        </div>

        {/* Mission */}
        <div className="footer-col">
          <h4>Our Mission</h4>
          <ul>
            <li><span>❤️ Connect donors with patients</span></li>
            <li><span>📋 Transparent fund tracking</span></li>
            <li><span>🔒 Secure & verified records</span></li>
            <li><span>📱 Mobile app coming soon</span></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {year} Blood Cancer Patient Support Platform. All rights reserved.</p>
        <p>
          Built with ❤️ by{' '}
          <a href="mailto:dhalisurjo30@gmail.com">Debashis Dhali</a>
          {' '}· Powered by React &amp; Supabase
        </p>
      </div>
    </footer>
  );
};

export default Footer;
