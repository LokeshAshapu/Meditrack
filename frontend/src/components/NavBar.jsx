
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function NavBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState("patient");
    const location = useLocation();
    const { theme, setTheme } = useTheme();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const checkAuth = () => {
            const email = localStorage.getItem("userEmail");
            // Ensure it's not the string "undefined" or "null" which can sometimes happen
            const isValid = email && email !== "undefined" && email !== "null";
            setIsLoggedIn(!!isValid);

            const role = localStorage.getItem("userRole");
            setUserRole(role || "patient");
        };

        checkAuth();

        // Listen for storage events to sync across tabs
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("notificationPermission"); // Clear any other stored data if needed
        localStorage.removeItem("userName");
        localStorage.removeItem("userPhone");
        localStorage.removeItem("userRole"); // Clear role
        setIsLoggedIn(false);
        setUserRole("patient");
        window.location.href = "/"; // Force full reload to clear any state
    };

    return (
        <nav className={`fixed w-full z-50 top-0 start-0 border-b transition-all duration-300 backdrop-blur-xl ${theme === 'dark'
            ? "bg-slate-900/85 border-slate-800"
            : "bg-white/85 border-slate-200 shadow-sm"
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to="/main" className="flex-shrink-0 flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl group-hover:scale-105 transition-transform">
                            M
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                            MediTrack
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {userRole === 'doctor' ? (
                            <>
                                <NavLink to="/doctor-dashboard">Dashboard</NavLink>
                                <NavLink to="/messages">Messages</NavLink>
                                <NavLink to="/doctor-profile">Profile</NavLink>
                                {/* Doctors don't strictly need Home or Specialities if it's patient facing, but Home is usually safe */}
                            </>
                        ) : (
                            <>
                                <NavLink to="/main">Home</NavLink>
                                <NavLink to="/find-doctors">Doctors</NavLink>
                                <NavLink to="/medical">Specialities</NavLink>
                                <NavLink to="/tracker">Tracker</NavLink>
                                <NavLink to="/Dashboard">Dashboard</NavLink>
                                <NavLink to="/messages">Messages</NavLink>
                                <NavLink to="/contact">Contact</NavLink>
                            </>
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-all text-sm">
                                Log Out
                            </button>
                        ) : (
                            <Link to="/login" className="px-5 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-all text-sm shadow-md shadow-cyan-500/20">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="px-4 py-6 space-y-3">
                        {userRole === 'doctor' ? (
                            <>
                                <MobileLink to="/doctor-dashboard" onClick={toggleMenu}>Dashboard</MobileLink>
                                <MobileLink to="/messages" onClick={toggleMenu}>Messages</MobileLink>
                                <MobileLink to="/doctor-profile" onClick={toggleMenu}>Profile</MobileLink>
                            </>
                        ) : (
                            <>
                                <MobileLink to="/main" onClick={toggleMenu}>Home</MobileLink>
                                <MobileLink to="/find-doctors" onClick={toggleMenu}>Doctors</MobileLink>
                                <MobileLink to="/medical" onClick={toggleMenu}>Medical Specialities</MobileLink>
                                <MobileLink to="/tracker" onClick={toggleMenu}>Tracker</MobileLink>
                                <MobileLink to="/Dashboard" onClick={toggleMenu}>Dashboard</MobileLink>
                                <MobileLink to="/messages" onClick={toggleMenu}>Messages</MobileLink>
                                <MobileLink to="/contact" onClick={toggleMenu}>Contact</MobileLink>
                            </>
                        )}

                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                            {isLoggedIn ? (
                                <button onClick={() => { toggleMenu(); handleLogout(); }} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors">
                                    Log Out
                                </button>
                            ) : (
                                <Link to="/login" onClick={toggleMenu} className="block w-full text-center py-3 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

function MobileLink({ to, onClick, children }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${isActive
                ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
        >
            {children}
        </Link>
    );
}

function NavLink({ to, children }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                : "text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
        >
            {children}
        </Link>
    );
}

export default NavBar;
