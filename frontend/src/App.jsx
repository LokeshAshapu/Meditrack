import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './components/WelcomePage';
import MainPage from './components/MainPage';
import MedicalSpecialities from './components/MedicalSpecialities';
import ContactPage from './components/ContactPage';
import Tracker from './components/Tracker';
import ScrollToTop from './components/ScrollToTop';
function App() {

  return (
    <>
      <Router>
            <ScrollToTop />
            <Routes>
                <Route path="/main" element={<MainPage />} />
                <Route path="/medical" element={<MedicalSpecialities />} />
                <Route path="/tracker" element={<Tracker />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/" element={<WelcomePage />} />
            </Routes>
      </Router>
    </>
  )
}

export default App
