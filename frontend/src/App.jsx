import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import MainPage from './components/MainPage';
import MedicalSpecialities from './components/MedicalSpecialities';
import ContactPage from './components/ContactPage';
import Tracker from './components/Tracker';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './components/pages/Dashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
function App() {

  return (
    <>
      <Router>
            <ScrollToTop />
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
      </Router>
    </>
  )
}

export default App
