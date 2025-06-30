import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Optional: Install lucide-react for modern icons
function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-gray-800 p-6 shadow-md sticky top-0 z-50 text-white">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/main" className="text-white text-lg font-bold">MediTrack</Link>
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="focus:outline-none">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                <div className="hidden md:flex space-x-6">
                    <Link to="/main" className="text-gray-300 hover:text-white scroll-mt-20">Home</Link>
                    <Link to="/medical" className="text-gray-300 hover:text-white scroll-mt-20">Medical Specialities</Link>
                    <Link to="/tracker" className="text-gray-300 hover:text-white scroll-mt-20">Tracker</Link>
                    <Link to="/contact" className="text-gray-300 hover:text-white scroll-mt-20">Contact</Link>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden px-4 mt-2 space-y-2">
                    <Link to="/main" onClick={toggleMenu} className="block text-gray-300 hover:text-white scroll-mt-20">Home</Link>
                    <Link to="/medical" onClick={toggleMenu} className="block text-gray-300 hover:text-white scroll-mt-20">Medical Specialities</Link>
                    <Link to="/tracker" onClick={toggleMenu} className="block text-gray-300 hover:text-white scroll-mt-20">Tracker</Link>
                    <Link to="/contact" onClick={toggleMenu} className="block text-gray-300 hover:text-white scroll-mt-20">Contact</Link>
                </div>
            )}
        </nav>
    );
}

export default NavBar;
