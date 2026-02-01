import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const MedicalFooter = () => {
  const role = localStorage.getItem("userRole") || "patient";

  return (
    <footer className="relative z-10 pt-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent">
      <div className="bg-white dark:bg-slate-950 transition-colors pt-16 pb-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">MediTrack</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Empowering your health journey with advanced medication tracking, smart reminders, and comprehensive medical speciality guides.
            </p>
            {/* <div className="flex gap-4 pt-2">
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Linkedin size={18} />} />
            </div> */}
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Platform</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              {role === 'doctor' ? (
                <>
                  <li><Link to="/doctor-dashboard" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Dashboard</Link></li>
                  <li><Link to="/messages" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Messages</Link></li>
                  <li><Link to="/doctor-profile" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">My Profile</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/main" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Home</Link></li>
                  <li><Link to="/tracker" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Medicine Tracker</Link></li>
                  <li><Link to="/medical" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Specialities</Link></li>
                  <li><Link to="/Dashboard" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Dashboard</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Support</h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/help" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Help Center</Link></li>
              <li><Link to="/privacy" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-500 hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Contact Info</h3>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-cyan-500 mt-0.5 shrink-0" />
                <p>Srikakulam, Andhra Pradesh, 532407</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-cyan-500 shrink-0" />
                <a href="mailto:lokeshashapu@gmail.com" className="hover:text-cyan-500 transition-colors">lokeshashapu@gmail.com</a>
              </div>
              {/* <div className="flex items-center gap-3">
                <Phone size={18} className="text-cyan-500 shrink-0" />
                <p>+91 6301451462</p>
              </div> */}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
            <p>© {new Date().getFullYear()} MediTrack. All rights reserved.</p>
            <p>Designed with ❤️ for better health.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

function SocialIcon({ icon }) {
  return (
    <a href="#" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-500 dark:hover:text-white transition-all scale-100 hover:scale-110">
      {icon}
    </a>
  )
}

export default MedicalFooter;
