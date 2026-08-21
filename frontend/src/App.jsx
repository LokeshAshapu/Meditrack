import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AboutPage from './components/pages/AboutPage';
import Tracker from './components/Tracker';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './components/pages/Dashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import DoctorDashboard from './components/pages/DoctorDashboard';
import ChatPage from './components/ChatPage';
import FindDoctors from './components/pages/FindDoctors';
import DoctorProfile from './components/pages/DoctorProfile';
import AdminDashboard from './components/pages/AdminDashboard';
import LoadingWrapper from './components/LoadingWrapper';
import HelpCenter from './components/HelpCenter';
import PrivacyPolicy from './components/PrivacyPolicy';
import PrivacyCenter from './components/pages/PrivacyCenter';
import TermsOfService from './components/TermsOfService';
import ProtectedRoute from './components/ProtectedRoute';
import AccessRestricted from './components/pages/AccessRestricted';
import NotFoundPage from './components/pages/NotFoundPage';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { requestPermissionAndToken } from './firebase';

if (import.meta.env.MODE === 'production') {
  disableReactDevTools();
}

function App() {

  useEffect(() => {
    requestPermissionAndToken();
  }, []);

  return (
    <>
      <ScrollToTop />
      <LoadingWrapper>
        <Layout>
          <Routes>
            {/* PUBLIC UNAUTHENTICATED ROUTES */}
            <Route path="/" element={<AboutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/access-restricted" element={<AccessRestricted />} />

            {/* PROTECTED PATIENT / GENERAL ROUTES */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/tracker" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><Tracker /></ProtectedRoute>} />
            <Route path="/find-doctors" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><FindDoctors /></ProtectedRoute>} />
            <Route path="/doctor-profile" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><DoctorProfile /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><ChatPage /></ProtectedRoute>} />
            <Route path="/privacy-center" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><PrivacyCenter /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><HelpCenter /></ProtectedRoute>} />
            <Route path="/privacy" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><PrivacyPolicy /></ProtectedRoute>} />
            <Route path="/terms" element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}><TermsOfService /></ProtectedRoute>} />

            {/* ROLE-PROTECTED DOCTOR ROUTES */}
            <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />

            {/* ROLE-PROTECTED ADMIN ROUTES */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* CATCH-ALL 404 ROUTE */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </LoadingWrapper>
    </>
  )
}

export default App