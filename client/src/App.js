import React, { useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Patients = lazy(() => import('./pages/Patients'));
const PatientDetails = lazy(() => import('./pages/PatientDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="App">
      <Navbar />
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
