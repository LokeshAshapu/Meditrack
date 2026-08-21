import React from 'react';
import { HelpCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    const isLoggedIn = !!localStorage.getItem("authToken");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-sans">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle size={36} />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">404 - Page Not Found</h1>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    The requested page does not exist or has been moved to another location.
                </p>

                <Link
                    to={isLoggedIn ? "/dashboard" : "/about"}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm inline-flex"
                >
                    <Home size={16} /> Return to {isLoggedIn ? "Dashboard" : "About Page"}
                </Link>
            </div>
        </div>
    );
}

export default NotFoundPage;
