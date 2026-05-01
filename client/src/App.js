import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Patients = lazy(() => import('./pages/Patients'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Global Error Boundary — prevents blank white screen on any unhandled error
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('App ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          color: '#64748b', textAlign: 'center', padding: '2rem'
        }}>
          <div style={{ fontSize: '3.5rem' }}>⚠️</div>
          <h2 style={{ color: '#0f172a', margin: 0 }}>Something went wrong</h2>
          <p style={{ maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
            An unexpected error occurred. Please reload the page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{
              marginTop: '0.5rem', padding: '0.75rem 2rem', borderRadius: '12px',
              border: 'none', background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: 'white', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer'
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="App">
      <Navbar />
      <ErrorBoundary>
        <Suspense fallback={<div className="global-loader"><div className="spinner" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={user ? <AdminDashboard /> : <Navigate to="/login" replace />}
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

const App = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </Router>
);

export default App;
