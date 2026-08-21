import React, { useState, useEffect } from "react";
import { User, LogOut, Calendar, MessageSquare, Activity, Clock, ChevronRight, Users, Bell, Video, CheckCircle, XCircle, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../utils/api";

function DoctorDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({ name: "", email: "", specialization: "General Medicine", experience: 0, profilePic: "" });
    const [appointments, setAppointments] = useState([]);
    const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
    const [availability, setAvailability] = useState({
        workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startHour: "09:00",
        endHour: "17:00",
        slotDuration: 30
    });

    useEffect(() => {
        fetchDoctorProfile();
        fetchAppointments();
    }, []);

    const fetchDoctorProfile = async () => {
        try {
            const res = await authFetch('/get-user-profile');
            const data = await res.json();
            if (res.ok && data.user) {
                setProfile(prev => ({ ...prev, ...data.user }));
                if (data.user.availability) setAvailability(data.user.availability);
            }
        } catch (error) { console.error("Failed to fetch doctor profile", error); }
    };

    const fetchAppointments = async () => {
        try {
            const res = await authFetch('/get-doctor-appointments');
            const data = await res.json();
            if (res.ok) setAppointments(data.appointments || []);
        } catch (error) { console.error("Error fetching appointments:", error); }
    };

    const handleUpdateStatus = async (aptId, newStatus) => {
        try {
            const res = await authFetch(`/update-appointment-status/${aptId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchAppointments();
        } catch (e) { alert("Failed to update status."); }
    };

    const handleSaveAvailability = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch('/update-profile', {
                method: "PUT",
                body: JSON.stringify({ availability })
            });
            if (res.ok) {
                alert("Clinical availability hours updated!");
                setIsAvailabilityOpen(false);
            }
        } catch (e) { alert("Failed to save availability."); }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const requestedApts = appointments.filter(a => a.status === 'requested');
    const confirmedApts = appointments.filter(a => a.status === 'confirmed' || a.status === 'in-progress');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-12">
            {/* Top Bar Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="text-cyan-500" size={24} />
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                            MediTrack Physician Portal
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsAvailabilityOpen(true)} className="flex items-center gap-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-200">
                            <Settings size={15} /> Clinical Availability
                        </button>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors p-2">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-8">
                {/* Physician Profile Bar */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center font-bold text-xl">
                            {profile.name.charAt(0) || "D"}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dr. {profile.name}</h2>
                            <p className="text-sm text-cyan-600 font-semibold">{profile.specialization} • {profile.experience} Years Exp.</p>
                        </div>
                    </div>
                </div>

                {/* Patient Consultation Requests */}
                {requestedApts.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Pending Consultation Requests</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {requestedApts.map(apt => (
                                <div key={apt.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-blue-600 uppercase">{apt.date} • {apt.time}</p>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg mt-1">{apt.patientName}</h4>
                                        <p className="text-xs text-slate-400">{apt.patientId}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateStatus(apt.id, 'confirmed')} className="bg-emerald-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl">Confirm</button>
                                        <button onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="bg-red-50 text-red-600 font-semibold text-xs px-3.5 py-2 rounded-xl">Decline</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confirmed & Active Consultations */}
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Confirmed Patient Consultations</h3>
                    {confirmedApts.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
                            <Calendar className="mx-auto text-slate-400 mb-3" size={40} />
                            <h4 className="font-semibold text-slate-800 dark:text-white text-lg">No Confirmed Consultations Scheduled</h4>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {confirmedApts.map(apt => (
                                <div key={apt.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md">{apt.date} • {apt.time}</span>
                                            <span className="text-xs font-bold uppercase text-blue-600">{apt.status}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{apt.patientName}</h4>
                                        <p className="text-xs text-slate-400">{apt.patientId}</p>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                                        <button
                                            onClick={() => window.open(`https://meet.jit.si/${apt.jitsiRoom}`, '_blank')}
                                            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                                        >
                                            <Video size={16} /> Start Video Session
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                            className="bg-emerald-100 text-emerald-700 font-semibold text-xs px-3.5 py-2.5 rounded-xl"
                                        >
                                            Complete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* MODAL: Availability Configuration */}
            {isAvailabilityOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Set Clinical Working Hours</h3>
                        <form onSubmit={handleSaveAvailability} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Start Hour</label>
                                    <input
                                        type="time"
                                        value={availability.startHour}
                                        onChange={(e) => setAvailability({ ...availability, startHour: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">End Hour</label>
                                    <input
                                        type="time"
                                        value={availability.endHour}
                                        onChange={(e) => setAvailability({ ...availability, endHour: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Slot Duration (Minutes)</label>
                                <select
                                    value={availability.slotDuration}
                                    onChange={(e) => setAvailability({ ...availability, slotDuration: Number(e.target.value) })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                >
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes</option>
                                    <option value={60}>60 Minutes</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-cyan-500 text-white font-bold py-3 rounded-xl">Save Availability</button>
                                <button type="button" onClick={() => setIsAvailabilityOpen(false)} className="px-4 py-3 text-slate-500 font-semibold">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorDashboard;
