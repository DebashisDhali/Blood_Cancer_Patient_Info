import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={close}>
          <span className="logo-icon">🩸</span>
          <div className="logo-text">
            <span className="logo-main">JU Cancer Support</span>
            <span className="logo-sub">Blood Cancer Patient Platform</span>
          </div>
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={close}>Home</Link></li>
          <li><Link to="/patients" className={`nav-link ${isActive('/patients') ? 'active' : ''}`} onClick={close}>Patients</Link></li>

          {user && (
            <>
              <li><Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={close}>Dashboard</Link></li>
              <li className="nav-user-item">
                <div className="nav-avatar">{(user.username || user.email || 'A')[0].toUpperCase()}</div>
                <button className="logout-btn" onClick={() => { logout(); close(); }}>Logout</button>
              </li>
            </>
          )}

          {!user && (
            <li>
              <Link to="/login" className="nav-login-btn" onClick={close}>Admin Login</Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
