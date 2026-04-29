import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span>🩸 Cancer Support</span>
        </div>
        <ul className="nav-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/patients">Patients</a></li>
          {user && (
            <>
              <li><a href="/admin">Dashboard</a></li>
              <li><button onClick={onLogout} className="logout-btn">Logout</button></li>
            </>
          )}
          {!user && (
            <>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
