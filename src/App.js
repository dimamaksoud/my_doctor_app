// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import PatientBooking from './pages/PatientBooking';
import BookingConfirmation from './pages/BookingConfirmation';
import AppointmentInquiry from './pages/AppointmentInquiry';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorProfile from './pages/DoctorProfile';
import PatientNotifications from './pages/PatientNotifications';
import DoctorsList from './pages/DoctorsList';
import ManageAppointments from './pages/ManageAppointments'; // أضف هذا السطر

// مكون للحماية
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// مكون للتخطيط الأساسي مع Header
const Layout = ({ children, showHeader = true }) => {
  return (
    <div className="app-layout">
      {showHeader && <Header />}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* الصفحات التي تظهر للعامة مع Header */}
          <Route path="/" element={
            <Layout showHeader={true}>
              <Home />
            </Layout>
          } />

          <Route path="/booking" element={
            <Layout showHeader={true}>
              <PatientBooking />
            </Layout>
          } />

          <Route path="/booking-confirmation" element={
            <Layout showHeader={true}>
              <BookingConfirmation />
            </Layout>
          } />

          <Route path="/appointment-inquiry" element={
            <Layout showHeader={true}>
              <AppointmentInquiry />
            </Layout>
          } />

          <Route path="/doctors" element={
            <Layout showHeader={true}>
              <DoctorsList />
            </Layout>
          } />

          {/* صفحة التسجيل/الدخول بدون Header */}
          <Route path="/login" element={<Login />} />

          {/* الصفحات المحمية (للأطباء المسجلين) مع Header */}
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute>
              <Layout showHeader={true}>
                <DoctorDashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/doctor-appointments" element={
            <ProtectedRoute>
              <Layout showHeader={true}>
                <DoctorAppointments />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/doctor-profile" element={
            <ProtectedRoute>
              <Layout showHeader={true}>
                <DoctorProfile />
              </Layout>
            </ProtectedRoute>
          } />

          {/* صفحة إدارة المواعيد الجديدة */}
          <Route path="/manage-appointments" element={
            <ProtectedRoute>
              <Layout showHeader={true}>
                <ManageAppointments />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/patient-notifications" element={
            <Layout showHeader={true}>
              <PatientNotifications />
            </Layout>
          } />

          {/* إعادة التوجيه للصفحات غير الموجودة */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
