import React, { useState } from 'react';
import { 
    Pill, Shield, HeartPulse, Stethoscope, Video, Lock, Activity, Users, 
    ArrowRight, CheckCircle2, AlertCircle, FileText, ChevronRight, Sparkles 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

function AboutPage() {
    const navigate = useNavigate();
    const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
    const [targetFeatureName, setTargetFeatureName] = useState("");
    const isLoggedIn = !!localStorage.getItem("authToken");

    const handleFeatureClick = (featureName, targetRoute) => {
        if (isLoggedIn) {
            navigate(targetRoute);
        } else {
            setTargetFeatureName(featureName);
            setIsLoginRequiredModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-16">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-cyan-900 via-slate-900 to-slate-900 text-white pt-20 pb-24 px-6">
                <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles size={14} /> Official MediTrack Platform Overview
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
                        Privacy-First Healthcare & Medication Adherence Platform
                    </h1>

                    <p className="text-base md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        MediTrack helps patients maintain daily medication compliance, store medical documents privately on-device, and connect with verified physicians through secure telemedicine consultations.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        {isLoggedIn ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                            >
                                Go to Patient Dashboard <ArrowRight size={18} />
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/signup"
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg transition-all flex items-center gap-2"
                                >
                                    Create Free Account <ArrowRight size={18} />
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-base px-8 py-3.5 rounded-2xl transition-all"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Core Purpose & Value Proposition Grid */}
            <section className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div 
                        onClick={() => handleFeatureClick("Medication Tracking", "/tracker")}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Pill size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Medication Adherence</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Multi-channel reminders (Push notifications, SMS, Email, Voice call alerts) preventing missed doses.
                        </p>
                    </div>

                    <div 
                        onClick={() => handleFeatureClick("Local Medical Vault", "/privacy-center")}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Shield size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Local Data Sovereignty</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Medical documents and lab reports remain encrypted locally in browser IndexedDB without cloud exposure.
                        </p>
                    </div>

                    <div 
                        onClick={() => handleFeatureClick("Verified Doctor Directory", "/find-doctors")}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Stethoscope size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">Verified Practitioners</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            AI-assisted credential verification and official medical council registry matching for verified doctors.
                        </p>
                    </div>

                    <div 
                        onClick={() => handleFeatureClick("Telemedicine Consultations", "/messages")}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Video size={24} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">WebRTC Video Consults</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Encrypted chat and instant Jitsi consultation rooms linked directly to confirmed appointments.
                        </p>
                    </div>
                </div>
            </section>

            {/* Q&A Platform Section */}
            <section className="max-w-5xl mx-auto px-6 pt-16 space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Understanding MediTrack</h2>
                    <p className="text-sm text-slate-500">Everything you need to know about our healthcare software infrastructure.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <h4 className="font-bold text-base text-cyan-600 flex items-center gap-2">
                            <CheckCircle2 size={18} /> What is MediTrack?
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            MediTrack is a digital healthcare management web application designed to simplify prescription routines, record compliance metrics, and enable patient-doctor consultations safely.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <h4 className="font-bold text-base text-cyan-600 flex items-center gap-2">
                            <CheckCircle2 size={18} /> Why does it exist?
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Medication non-adherence causes avoidable health complications. MediTrack addresses this by combining automated multi-channel escalation reminders with structured clinical oversight.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <h4 className="font-bold text-base text-cyan-600 flex items-center gap-2">
                            <CheckCircle2 size={18} /> How is user data protected?
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            MediTrack follows a minimal central storage philosophy. Sensitive medical files stay on your device in IndexedDB, and chat messages are encrypted client-side using AES-256 before transmission.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <h4 className="font-bold text-base text-cyan-600 flex items-center gap-2">
                            <CheckCircle2 size={18} /> Who can use MediTrack?
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            MediTrack is built for individual patients managing daily medications, verified physicians conducting consultations, and clinic organizations operating pilot programs.
                        </p>
                    </div>
                </div>
            </section>

            {/* First-Time User 7-Step Guide */}
            <section className="max-w-5xl mx-auto px-6 pt-16">
                <div className="bg-gradient-to-r from-slate-900 to-cyan-950 text-white p-8 md:p-12 rounded-3xl border border-slate-800 space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl md:text-3xl font-extrabold">Getting Started in 7 Simple Steps</h3>
                        <p className="text-xs text-cyan-300">A simple step-by-step roadmap for new users.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                            <span className="font-extrabold text-cyan-400">01. Learn</span>
                            <p className="font-semibold text-slate-200">Explore MediTrack features on the About page.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                            <span className="font-extrabold text-cyan-400">02. Register</span>
                            <p className="font-semibold text-slate-200">Create your free patient or doctor account.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                            <span className="font-extrabold text-cyan-400">03. Profile Setup</span>
                            <p className="font-semibold text-slate-200">Configure emergency contacts and basic details.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                            <span className="font-extrabold text-cyan-400">04. Add Medications</span>
                            <p className="font-semibold text-slate-200">Enter dosage schedules and food relation rules.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                            <span className="font-extrabold text-cyan-400">05. Track Adherence</span>
                            <p className="font-semibold text-slate-200">Confirm daily doses and view compliance trends.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
                            <span className="font-extrabold text-cyan-400">06. Find Doctors</span>
                            <p className="font-semibold text-slate-200">Search verified specialist directories.</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 lg:col-span-2">
                            <span className="font-extrabold text-cyan-400">07. Consult Safely</span>
                            <p className="font-semibold text-slate-200">Book appointments and launch secure WebRTC video sessions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MODAL: Login Required Interstitial Notice (Phase 5) */}
            {isLoginRequiredModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center mx-auto">
                            <Lock size={28} />
                        </div>

                        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">Login Required</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Please log in or create a MediTrack account to access <strong className="text-cyan-600">{targetFeatureName || "this feature"}</strong>.
                        </p>

                        <div className="flex flex-col gap-2.5 pt-2">
                            <button
                                onClick={() => navigate(`/login?redirect=${encodeURIComponent('/dashboard')}`)}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl shadow-sm text-sm"
                            >
                                Login to Account
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl text-sm"
                            >
                                Create Free Account
                            </button>
                            <button
                                onClick={() => setIsLoginRequiredModalOpen(false)}
                                className="text-xs text-slate-400 font-medium py-1"
                            >
                                Continue Browsing About Page
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AboutPage;
