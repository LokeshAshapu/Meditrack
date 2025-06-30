import React from 'react';
import { Link } from 'react-router-dom';

const MedicalFooter = () => {
  return (
    <footer className="bg-blue-950 text-white bottom-0 w-full  mt-10">
      <div className="max-w-7xl mx-auto w-full px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-1">About MediTrack</h3>
          <p className="text-sm">
            MediTrack helps users stay on schedule with their medications, receive reminders, and notify caregivers upon completion.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-1">Features</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tracker" className="hover:underline">Medicine Tracker</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-1">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:underline">Help Center</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-1">Contact</h3>
          <p className="text-sm">Srikakulam , Andhra Pradesh , 532407</p>
          <p className="text-sm mt-1">Email: teamconverge@gmail.com</p>
          <p className="text-sm">Phone: +91 6301451462</p>
        </div>
      </div>


      <div className="border-t border-white/20 text-center py-4 text-sm">
        © {new Date().getFullYear()} MediTrack. All rights reserved.
      </div>
    </footer>
  );
};

export default MedicalFooter;
