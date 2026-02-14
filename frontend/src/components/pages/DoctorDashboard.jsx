
import React, { useState, useEffect } from "react";
import { User, LogOut, Calendar, MessageSquare, Activity, Clock, ChevronRight, Users, Bell, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DoctorDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        specialization: "General",
        experience: 0,
        profilePic: ""
    });

    useEffect(() => {
        const fetchDoctorProfile = async () => {
            const email = localStorage.getItem("userEmail");
            if (email) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-user-profile?email=${email}`);
                    const data = await res.json();
                    if (res.ok) {
                        setProfile(prev => ({ ...prev, ...data.user }));
                    }
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                }
            }
        };
        fetchDoctorProfile();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const navigateToProfile = () => {
        navigate("/doctor-profile");
    };

    const [stats, setStats] = useState({
        appointments: 0,
        patients: 0,
        consultations: 0,
        waitTime: "0m"
    });

    // Fetch Appointments to update stats
    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (email) {
            fetch(`${import.meta.env.VITE_API_BASE}/get-doctor-appointments?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    if (data.appointments) {
                        setAppointments(data.appointments);
                        setStats(prev => ({
                            ...prev,
                            appointments: data.appointments.length,
                            patients: new Set(data.appointments.map(a => a.patientId)).size
                        }));
                    }
                })
                .catch(err => console.error("Error fetching appointments:", err));
        }
    }, []);

    const [appointments, setAppointments] = useState([]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="text-cyan-500" size={24} />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                            Doctor Portal
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">{profile?.name || "Doctor"}</p>
                                <p className="text-xs text-slate-500">{profile?.specialization || "Specialist"}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                                {profile?.profilePic ? (
                                    <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={24} className="text-slate-400 m-auto mt-1.5" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<Users size={24} />}
                        label="Total Patients"
                        value={stats.patients}
                        subtext="Unique patients"
                        color="blue"
                    />
                    <StatCard
                        icon={<Calendar size={24} />}
                        label="Appointments"
                        value={stats.appointments}
                        subtext="Total scheduled"
                        color="indigo"
                    />
                    <StatCard
                        icon={<Activity size={24} />}
                        label="Consultations"
                        value={stats.consultations}
                        subtext="Completed sessions"
                        color="purple"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Schedule Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Appointments</h2>
                            <button onClick={navigateToProfile} className="text-sm font-medium text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                                Manage Availability <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[300px]">
                            {appointments.length > 0 ? (
                                <div className="space-y-4">
                                    {appointments.map((apt) => (
                                        <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                            <div className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white font-bold">
                                                <span className="text-xs text-slate-400 uppercase">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                                <span className="text-lg">{new Date(apt.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{apt.patientName}</h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                        {apt.status ? apt.status.charAt(0).toUpperCase() + apt.status.slice(1) : "Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {apt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => window.open(`https://meet.jit.si/meditrack-${apt.id}`, '_blank')}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                        title="Join Video Call"
                                                    >
                                                        <Video size={20} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate('/messages', { state: { startChatWith: { email: apt.patientId, name: apt.patientName } } })}
                                                    className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                                                    title={`Message ${apt.patientName}`}
                                                >
                                                    <MessageSquare size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                                    <Calendar size={48} className="mb-4 opacity-20" />
                                    <p>No appointments scheduled yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pending Requests / Quick Actions */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Quick Actions</h2>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                            <button
                                onClick={navigateToProfile}
                                className="w-full py-3 px-4 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 rounded-xl font-medium flex items-center justify-between hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
                            >
                                <span className="flex items-center gap-3"><Calendar size={18} /> Available Slots / Schedule</span>
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => navigate("/messages")}
                                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="flex items-center gap-3"><Users size={18} /> Manage Patients</span>
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={navigateToProfile}
                                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="flex items-center gap-3"><User size={18} /> Edit Profile</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="relative z-10 text-white">
                                <h3 className="text-lg font-bold mb-1">Telemedicine Pro</h3>
                                <p className="text-indigo-100 text-sm mb-4">View your session analytics and reports.</p>
                                <button
                                    onClick={() => alert("Detailed analytics dashboard coming soon!")}
                                    className="py-2 px-4 bg-white/20 backdrop-blur-md rounded-lg text-sm font-semibold hover:bg-white/30 transition-colors"
                                >
                                    View Analytics
                                </button>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value, subtext, color }) {
    const colorClasses = {
        blue: "bg-blue-100 text-blue-600",
        indigo: "bg-indigo-100 text-indigo-600",
        purple: "bg-purple-100 text-purple-600",
        cyan: "bg-cyan-100 text-cyan-600",
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                    {icon}
                </div>
                {/* <span className="text-green-500 text-xs font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">+12%</span> */}
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</h3>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
            <p className="text-xs text-slate-400">{subtext}</p>
        </div>
    );
}

function AppointmentItem({ time, patient, type, status, active }) {
    const statusColors = {
        "Completed": "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
        "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
        "Upcoming": "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
    };

    return (
        <div className={`p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700 last:border-0 ${active ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'} transition-colors`}>
            <div className="flex items-center gap-4">
                <div className="text-center w-16">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{time}</p>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{patient}</h4>
                    <p className="text-sm text-slate-500">{type}</p>
                </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                {status}
            </span>
        </div>
    );
}

export default DoctorDashboard;
