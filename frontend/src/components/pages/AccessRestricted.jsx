import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AccessRestricted() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole") || "patient";

    const handleBack = () => {
        if (userRole === 'doctor') navigate('/doctor-dashboard');
        else if (userRole === 'admin') navigate('/admin');
        else navigate('/dashboard');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-sans">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert size={36} />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Access Restricted</h1>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    You don't have authorization permission to access this section of MediTrack.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleBack}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Return to Authorized Dashboard
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccessRestricted;
