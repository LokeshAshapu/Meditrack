import React, { useEffect } from 'react';
// 1. REMOVE BrowserRouter (aliased as Router) from this import
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import WelcomePage from './components/WelcomePage';
import MainPage from './components/MainPage';
import MedicalSpecialities from './components/MedicalSpecialities';
import ContactPage from './components/ContactPage';
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
import TermsOfService from './components/TermsOfService';
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
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/medical" element={<MedicalSpecialities />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-center" element={<PrivacyCenter />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/" element={<WelcomePage />} />
            <Route path='/Dashboard' element={<Dashboard />} />
            <Route path='/doctor-dashboard' element={<DoctorDashboard />} />
            <Route path='/messages' element={<ChatPage />} />
            <Route path='/find-doctors' element={<FindDoctors />} />
            <Route path='/doctor-profile' element={<DoctorProfile />} />
            <Route path='/admin' element={<AdminDashboard />} />
          </Routes>
        </Layout>
      </LoadingWrapper>
      {/* 3. REMOVE the closing </Router> tag */}
    </>
  )
}

export default App