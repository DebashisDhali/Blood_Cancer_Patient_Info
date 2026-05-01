import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/Auth.css';

const EyeIcon = ({ visible }) => (
  <svg
    className="eye-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2 12C3.73 7.61 7.52 4.5 12 4.5C16.48 4.5 20.27 7.61 22 12C20.27 16.39 16.48 19.5 12 19.5C7.52 19.5 3.73 16.39 2 12Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    {!visible && (
      <path
        d="M4 20L20 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    )}
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/admin');
    } else {
      if (result.message.includes('verified')) {
        setError('📧 Your account is not verified. Please check your email inbox and spam folder for the activation link.');
      } else if (result.message.includes('password')) {
        setError('❌ Incorrect password. Please try again or reset your password if you forgot it.');
      } else {
        setError(result.message || '⚠️ Login failed. Please check your credentials.');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Admin Login</h2>
        
        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          name="email"
          id="email"
          placeholder="Email or Username"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />

        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p>Don't have an account? <a href="/register">Register here</a></p>
      </form>
    </div>
  );
};

export default Login;
