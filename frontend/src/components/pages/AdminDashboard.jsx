
import React, { useState, useEffect } from 'react';
import { User, Check, X, Shield, FileText, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        const email = localStorage.getItem("userEmail");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-unverified-doctors`, {
                headers: { "admin-email": email }
            });
            const data = await res.json();
            if (res.ok) {
                setDoctors(data.doctors);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (doctorEmail) => {
        const adminEmail = localStorage.getItem("userEmail");
        if (!confirm("Are you sure you want to verify this doctor?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/verify-doctor`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "admin-email": adminEmail
                },
                body: JSON.stringify({ email: doctorEmail })
            });
            if (res.ok) {
                alert("Doctor verified!");
                fetchDoctors(); // Refresh list
            }
        } catch (error) {
            console.error("Verification failed:", error);
        }
    };

    const handleReject = async (doctorEmail) => {
        const adminEmail = localStorage.getItem("userEmail");
        if (!confirm("Are you sure you want to REJECT and DELETE this account? This cannot be undone.")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/reject-doctor`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "admin-email": adminEmail
                },
                body: JSON.stringify({ email: doctorEmail })
            });
            if (res.ok) {
                alert("Doctor rejected.");
                fetchDoctors();
            }
        } catch (error) {
            console.error("Rejection failed:", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            {/* Admin Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <Shield className="text-purple-600" size={24} />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                        MediTrack Admin
                    </span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </nav>

            <main className="pt-24 px-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Verification Queue</h1>
                    <p className="text-slate-500">Review and approve doctor registrations.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : doctors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {doctors.map(doc => (
                            <div key={doc.email} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                                <div className="p-6 flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                            {doc.profilePic ? (
                                                <img src={doc.profilePic} alt={doc.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{doc.name}</h3>
                                            <p className="text-sm text-slate-500">{doc.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full font-medium">
                                                {doc.specialization}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Hospital:</span>
                                            <span className="font-medium">{doc.hospital || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Experience:</span>
                                            <span className="font-medium">{doc.experience} years ({doc.experienceLevel})</span>
                                        </div>

                                        {doc.medicalIdCard ? (
                                            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1"><FileText size={12} /> Medical ID Proof</p>
                                                <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(doc.medicalIdCard, '_blank')}>
                                                    <img src={doc.medicalIdCard} alt="ID Preview" className="w-full h-full object-contain" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
                                                <AlertCircle size={14} /> No ID Proof Uploaded
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                                    <button
                                        onClick={() => handleReject(doc.email)}
                                        className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleVerify(doc.email)}
                                        className="flex-1 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} /> Verify
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Check size={48} className="mb-4 text-green-500 opacity-20" />
                        <p className="text-lg font-medium">All caught up!</p>
                        <p className="text-sm">No pending doctor verifications.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
