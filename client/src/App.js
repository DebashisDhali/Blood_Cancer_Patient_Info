import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="App">
      <Navbar />
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
