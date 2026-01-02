import React, { useEffect } from 'react';
// 1. REMOVE BrowserRouter (aliased as Router) from this import
import { Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import MainPage from './components/MainPage';
import MedicalSpecialities from './components/MedicalSpecialities';
import ContactPage from './components/ContactPage';
import Tracker from './components/Tracker';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './components/pages/Dashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import LoadingWrapper from './components/LoadingWrapper';
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
      {/* 2. REMOVE the <Router> wrapper from here */}
      <ScrollToTop />
      <LoadingWrapper>
      <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/medical" element={<MedicalSpecialities />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/" element={<WelcomePage />} />
          <Route path='/Dashboard' element={<Dashboard/>} />
      </Routes>
      </LoadingWrapper>
      {/* 3. REMOVE the closing </Router> tag */}
    </>
  )
}

export default App