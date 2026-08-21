import React, { useState, useEffect, useRef } from "react";
import { 
    User, LogOut, Check, Trash2, Calendar, Clock, Plus, Layout, Edit2, BarChart2, 
    Repeat, Sparkles, X, Camera, FileText, Video, Mail, Phone, TrendingUp, Upload, 
    FilePlus, AlertTriangle, ShieldAlert, Heart, Activity, HardDrive, MessageSquare, 
    Search, Filter, Pause, Play, CheckCircle2, XCircle, RefreshCw, Star, Info
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import localforage from "localforage";
import { authFetch } from "../../utils/api";
import SpinnerLoading from "../spinnerLoading";

function Dashboard() {
    const [activeTab, setActiveTab] = useState("today"); // 'today' | 'upcoming' | 'health' | 'vault' | 'timeline'
    const [message, setMessage] = useState("");
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Profile & Emergency Contacts
    const [userProfile, setUserProfile] = useState({ name: "", email: "", phoneNumber: "", profilePic: "", emergencyContacts: [] });
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
    const [editProfileData, setEditProfileData] = useState({ name: "", phoneNumber: "", profilePic: "" });
    const [isSosModalOpen, setIsSosModalOpen] = useState(false);
    const [sosNote, setSosNote] = useState("");
    const [isSosBroadcasting, setIsSosBroadcasting] = useState(false);
    const [isEmergencyConfigOpen, setIsEmergencyConfigOpen] = useState(false);
    const [emergencyContacts, setEmergencyContacts] = useState([{ name: "", relationship: "", phoneNumber: "" }]);

    // Tracker & Medication 2.0 State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMed, setNewMed] = useState({
        medicine: "", genericName: "", dosage: "1", dosageUnit: "tablet", frequency: "Daily",
        route: "Oral", time: "08:00", foodRelation: "after_food", instructions: "Take with water"
    });

    const [logs, setLogs] = useState([]);
    const [streak, setStreak] = useState(0);
    const [adherenceIntel, setAdherenceIntel] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [appointments, setAppointments] = useState([]);

    // Medical Vault 2.0 State (IndexedDB)
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [recordSearch, setRecordSearch] = useState("");
    const [recordFilter, setRecordFilter] = useState("all"); // 'all' | 'Prescription' | 'Lab Report' | 'Scan'
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadData, setUploadData] = useState({ title: "", category: "Prescription", description: "", file: null, fileName: "" });
    const [storageUsage, setStorageUsage] = useState({ usedMB: 0, remainingMB: 50 });

    // Pilot Feedback State
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [feedbackData, setFeedbackData] = useState({ rating: 5, category: "experience", comment: "" });

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const name = localStorage.getItem("userName");
        const phone = localStorage.getItem("userPhone");

        if (email) {
            setUserProfile({
                name: name || "Patient",
                email: email,
                phoneNumber: phone || "Not set",
                profilePic: localStorage.getItem("userProfilePic") || "",
                emergencyContacts: []
            });
            loadData();
        } else {
            setMessage("Please log in to access your patient dashboard.");
        }
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchCards(), fetchLogs(), fetchStreak(), fetchAdherence(), 
                fetchAppointments(), fetchMedicalRecords(), fetchTimeline(), fetchProfile()
            ]);
        } catch (error) {
            console.error("Error loading patient data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await authFetch('/get-user-profile');
            const data = await res.json();
            if (res.ok && data.user) {
                setUserProfile(prev => ({ ...prev, ...data.user }));
                if (data.user.emergencyContacts) setEmergencyContacts(data.user.emergencyContacts);
            }
        } catch (e) { console.error(e); }
    };

    const fetchCards = async () => {
        try {
            const res = await authFetch('/get-tracker');
            const data = await res.json();
            if (res.ok) setCards(data.data || []);
        } catch (error) { console.error("Error fetching cards:", error); }
    };

    const fetchLogs = async () => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const res = await authFetch(`/get-logs?date=${today}`);
            const data = await res.json();
            if (res.ok) setLogs(data.data || []);
        } catch (error) { console.error("Error fetching logs:", error); }
    };

    const fetchStreak = async () => {
        try {
            const res = await authFetch('/get-streak');
            const data = await res.json();
            if (res.ok) setStreak(data.streak || 0);
        } catch (error) { console.error("Error fetching streak:", error); }
    };

    const fetchAdherence = async () => {
        try {
            const res = await authFetch('/get-adherence-intelligence');
            const data = await res.json();
            if (res.ok) setAdherenceIntel(data);
        } catch (error) { console.error("Error fetching adherence:", error); }
    };

    const fetchAppointments = async () => {
        try {
            const res = await authFetch('/get-patient-appointments');
            const data = await res.json();
            if (res.ok) setAppointments(data.appointments || []);
        } catch (error) { console.error("Error fetching appointments:", error); }
    };

    const fetchTimeline = async () => {
        try {
            const res = await authFetch('/get-health-timeline');
            const data = await res.json();
            if (res.ok) setTimeline(data.timeline || []);
        } catch (error) { console.error("Error fetching timeline:", error); }
    };

    // --- Medical Vault 2.0 (IndexedDB localforage) ---
    const fetchMedicalRecords = async () => {
        const email = localStorage.getItem("userEmail");
        if (!email) return;
        try {
            const records = await localforage.getItem(`medicalRecords_${email}`) || [];
            setMedicalRecords(records);

            // Calculate Storage Quota
            const jsonString = JSON.stringify(records);
            const sizeInBytes = new Blob([jsonString]).size;
            const usedMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
            setStorageUsage({ usedMB: Number(usedMB), remainingMB: Math.max(0, 50 - Number(usedMB)).toFixed(2) });
        } catch (err) { console.error("Could not fetch local records", err); }
    };

    const handleUploadRecord = async (e) => {
        e.preventDefault();
        if (!uploadData.title || !uploadData.file) {
            alert("Please provide a document title and file.");
            return;
        }

        try {
            const email = localStorage.getItem("userEmail");
            const newRecord = {
                id: `doc_${Date.now()}`,
                title: uploadData.title,
                category: uploadData.category,
                description: uploadData.description,
                fileData: uploadData.file,
                fileName: uploadData.fileName,
                uploadedAt: new Date().toISOString()
            };

            const existingRecords = await localforage.getItem(`medicalRecords_${email}`) || [];
            const updatedRecords = [newRecord, ...existingRecords];
            await localforage.setItem(`medicalRecords_${email}`, updatedRecords);

            setIsUploadModalOpen(false);
            setUploadData({ title: "", category: "Prescription", description: "", file: null, fileName: "" });
            fetchMedicalRecords();
            setMessage("Document safely stored in your local browser vault!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            alert("Error storing document locally.");
        }
    };

    const handleDeleteRecord = async (recordId) => {
        if (!window.confirm("Are you sure you want to delete this medical record from local storage?")) return;
        try {
            const email = localStorage.getItem("userEmail");
            const existingRecords = await localforage.getItem(`medicalRecords_${email}`) || [];
            const updatedRecords = existingRecords.filter(r => r.id !== recordId);
            await localforage.setItem(`medicalRecords_${email}`, updatedRecords);
            fetchMedicalRecords();
        } catch (error) { console.error(error); }
    };

    // Dose Logging
    const handleLogDose = async (medicine, status, time) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const res = await authFetch('/log-medication', {
                method: "POST",
                body: JSON.stringify({ medicine, date: today, status, time })
            });
            if (res.ok) {
                fetchLogs();
                fetchAdherence();
                fetchTimeline();
            }
        } catch (error) { console.error("Error logging dose:", error); }
    };

    // Medication 2.0 Add
    const handleAddMedication = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch('/add-tracker', {
                method: "POST",
                body: JSON.stringify(newMed)
            });
            if (res.ok) {
                setIsAddModalOpen(false);
                setNewMed({ medicine: "", genericName: "", dosage: "1", dosageUnit: "tablet", frequency: "Daily", route: "Oral", time: "08:00", foodRelation: "after_food", instructions: "Take with water" });
                fetchCards();
                setMessage("Medication schedule created cleanly!");
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (e) { alert("Error adding medication."); }
    };

    const handlePauseMedication = async (id) => {
        try {
            const res = await authFetch(`/pause-tracker/${id}`, { method: "PATCH" });
            if (res.ok) fetchCards();
        } catch (e) { console.error(e); }
    };

    const handleResumeMedication = async (id) => {
        try {
            const res = await authFetch(`/resume-tracker/${id}`, { method: "PATCH" });
            if (res.ok) fetchCards();
        } catch (e) { console.error(e); }
    };

    // Emergency SOS Trigger
    const handleTriggerSos = async () => {
        setIsSosBroadcasting(true);
        try {
            const res = await authFetch('/trigger-sos', {
                method: "POST",
                body: JSON.stringify({ note: sosNote })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`🚨 SOS Broadcast Dispatched!\nNotified ${data.notifiedCount} Emergency Contacts via SMS/Voice call.`);
                setIsSosModalOpen(false);
                setSosNote("");
                fetchTimeline();
            } else {
                alert(data.message || "Failed to trigger SOS broadcast.");
            }
        } catch (e) {
            alert("Error sending SOS alert.");
        } finally {
            setIsSosBroadcasting(false);
        }
    };

    const handleSaveEmergencyContacts = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch('/update-emergency-contacts', {
                method: "PUT",
                body: JSON.stringify({ emergencyContacts })
            });
            if (res.ok) {
                alert("Emergency contacts updated successfully!");
                setIsEmergencyConfigOpen(false);
            }
        } catch (e) { alert("Failed to save emergency contacts."); }
    };

    // Pilot Feedback Submit
    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch('/api/feedback', {
                method: "POST",
                body: JSON.stringify(feedbackData)
            });
            if (res.ok) {
                alert("Thank you! Your feedback has been sent to the MediTrack engineering team.");
                setIsFeedbackOpen(false);
                setFeedbackData({ rating: 5, category: "experience", comment: "" });
            }
        } catch (e) { alert("Failed to submit feedback."); }
    };

    if (isLoading) return <SpinnerLoading />;

    const todayStr = new Date().toISOString().split('T')[0];
    const loggedMedsMap = logs.reduce((acc, log) => ({ ...acc, [log.medicine]: log.status }), {});
    const dueMeds = cards.filter(c => c.status !== 'paused');
    const completedCount = dueMeds.filter(c => loggedMedsMap[c.medicine] === 'taken').length;
    const todayAdherence = dueMeds.length > 0 ? Math.round((completedCount / dueMeds.length) * 100) : 100;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-16">
            {/* Top Bar Header */}
            <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                            {userProfile.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                                Welcome back, {userProfile.name}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">MediTrack Patient Healthcare Journey</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Emergency SOS Button */}
                        <button
                            onClick={() => setIsSosModalOpen(true)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center gap-2 animate-pulse"
                        >
                            <ShieldAlert size={16} /> SOS Emergency Alert
                        </button>
                        <button
                            onClick={() => setIsFeedbackOpen(true)}
                            className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 text-purple-600 dark:text-purple-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5"
                        >
                            <Star size={15} /> Send Feedback
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-8">
                {message && (
                    <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-sm font-medium flex items-center justify-between">
                        <span>{message}</span>
                        <X size={16} className="cursor-pointer" onClick={() => setMessage("")} />
                    </div>
                )}

                {/* Patient Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'today', label: "Today's Plan", icon: Clock },
                        { id: 'upcoming', label: "Upcoming Appointments", icon: Calendar },
                        { id: 'health', label: "Adherence Analytics", icon: TrendingUp },
                        { id: 'vault', label: "Local Vault 2.0", icon: HardDrive },
                        { id: 'timeline', label: "Health Timeline", icon: Activity }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                                    active 
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: TODAY */}
                {activeTab === 'today' && (
                    <div>
                        {/* Summary Metrics Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between text-slate-400 mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider">Today's Adherence</span>
                                    <Activity className="text-cyan-500" size={18} />
                                </div>
                                <p className="text-3xl font-extrabold text-slate-800 dark:text-white">{todayAdherence}%</p>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all" style={{ width: `${todayAdherence}%` }}></div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between text-slate-400 mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider">Daily Streak</span>
                                    <Sparkles className="text-amber-500" size={18} />
                                </div>
                                <p className="text-3xl font-extrabold text-amber-500">{streak} Days 🔥</p>
                                <p className="text-xs text-slate-400 mt-2">Consecutive adherence visits</p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between text-slate-400 mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider">Doses Completed</span>
                                    <CheckCircle2 className="text-emerald-500" size={18} />
                                </div>
                                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount} / {dueMeds.length}</p>
                                <p className="text-xs text-slate-400 mt-2">Scheduled for today</p>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between text-slate-400 mb-2">
                                    <span className="text-xs font-semibold uppercase tracking-wider">Emergency Contacts</span>
                                    <Phone className="text-purple-500" size={18} />
                                </div>
                                <p className="text-3xl font-extrabold text-purple-600">{userProfile.emergencyContacts?.length || emergencyContacts.length}</p>
                                <button onClick={() => setIsEmergencyConfigOpen(true)} className="text-xs text-purple-600 font-semibold mt-2 hover:underline">
                                    Manage Contacts →
                                </button>
                            </div>
                        </div>

                        {/* Medications Checklist Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Today's Medication Checklist</h2>
                                <p className="text-sm text-slate-500">Track and log your active dosage schedule.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
                            >
                                <Plus size={18} /> Add Medication 2.0
                            </button>
                        </div>

                        {dueMeds.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                                <Heart className="mx-auto text-cyan-500 mb-3" size={40} />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No Active Medications Scheduled</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-4">You have no active medication reminders set for today.</p>
                                <button onClick={() => setIsAddModalOpen(true)} className="bg-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-xl">Add Medication Now</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dueMeds.map((med) => {
                                    const logStatus = loggedMedsMap[med.medicine];
                                    const isTaken = logStatus === 'taken';
                                    const isSkipped = logStatus === 'skipped';

                                    return (
                                        <div key={med.id} className={`bg-white dark:bg-slate-800 rounded-2xl border p-6 shadow-sm flex flex-col justify-between transition-all ${
                                            isTaken ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20' : 'border-slate-200 dark:border-slate-700'
                                        }`}>
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2.5 py-1 rounded-md">
                                                            {med.time}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-2">{med.medicine}</h3>
                                                        {med.genericName && <p className="text-xs text-slate-400 italic">({med.genericName})</p>}
                                                    </div>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                                        isTaken ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                                                        isSkipped ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                    }`}>
                                                        {isTaken ? '✓ Taken' : isSkipped ? 'Skipped' : 'Pending'}
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300 mb-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                                                    <p><span className="font-medium text-slate-400">Dosage:</span> {med.dosage} {med.dosageUnit || 'dose'} ({med.route || 'Oral'})</p>
                                                    <p><span className="font-medium text-slate-400">Instructions:</span> {med.foodRelation === 'after_food' ? 'After food' : 'Before food'} • {med.instructions}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                {!isTaken ? (
                                                    <button
                                                        onClick={() => handleLogDose(med.medicine, 'taken', med.time)}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <Check size={16} /> Mark Taken
                                                    </button>
                                                ) : (
                                                    <button disabled className="flex-1 bg-emerald-100 text-emerald-700 text-sm font-semibold py-2 rounded-xl text-center">
                                                        ✓ Completed
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleLogDose(med.medicine, 'skipped', med.time)}
                                                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                                >
                                                    Skip
                                                </button>
                                                <button
                                                    onClick={() => handlePauseMedication(med.id)}
                                                    className="p-2 text-slate-400 hover:text-amber-500 rounded-xl transition-colors"
                                                    title="Pause Reminders"
                                                >
                                                    <Pause size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: UPCOMING APPOINTMENTS */}
                {activeTab === 'upcoming' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Scheduled Appointments</h2>
                            <p className="text-sm text-slate-500">Your upcoming consultations with verified physicians.</p>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                                <Calendar className="mx-auto text-blue-500 mb-3" size={40} />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No Upcoming Appointments</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-4">Book a consultation with a verified doctor from the Telemedicine directory.</p>
                                <a href="/find-doctors" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-xl inline-block">Find Doctors</a>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {appointments.map(apt => (
                                    <div key={apt.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-md">
                                                    {apt.date} • {apt.time}
                                                </span>
                                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-2">Dr. {apt.doctorId}</h3>
                                                <p className="text-xs text-slate-400">Status: <span className="font-semibold text-blue-600 uppercase">{apt.status}</span></p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                <Video size={20} />
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => window.open(`https://meet.jit.si/${apt.jitsiRoom}`, '_blank')}
                                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Video size={16} /> Join Secure Video Room
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: ADHERENCE ANALYTICS */}
                {activeTab === 'health' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Adherence Analytics & Intelligence 2.0</h2>
                            <p className="text-sm text-slate-500">Comprehensive compliance calculations based on actual dose logs.</p>
                        </div>

                        {adherenceIntel && (
                            <div className="space-y-6">
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-start gap-3">
                                    <Sparkles className="text-purple-600 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="font-bold text-purple-900 dark:text-purple-300 text-sm">Adherence Pattern Insights</h4>
                                        <p className="text-sm text-purple-700 dark:text-purple-400 mt-0.5">{adherenceIntel.patternInsight}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">30-Day Adherence</p>
                                        <p className="text-4xl font-extrabold text-cyan-600 mt-2">{adherenceIntel.adherence30}%</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">90-Day Adherence</p>
                                        <p className="text-4xl font-extrabold text-blue-600 mt-2">{adherenceIntel.adherence90}%</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Overall Adherence</p>
                                        <p className="text-4xl font-extrabold text-purple-600 mt-2">{adherenceIntel.overallRate}%</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: LOCAL VAULT 2.0 */}
                {activeTab === 'vault' && (
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Local Medical Vault 2.0</h2>
                                <p className="text-sm text-slate-500">Stored local-only in your browser IndexedDB (Zero Cloud Leakage).</p>
                            </div>
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center gap-2"
                            >
                                <Upload size={18} /> Store Local Document
                            </button>
                        </div>

                        {/* Storage Quota Meter */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <HardDrive className="text-cyan-500" size={24} />
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">Local Storage Quota</p>
                                    <p className="text-xs text-slate-400">{storageUsage.usedMB} MB used of 50 MB local capacity</p>
                                </div>
                            </div>
                            <div className="w-48 bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(storageUsage.usedMB / 50) * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Search and Category Filter */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search medical documents..."
                                    value={recordSearch}
                                    onChange={(e) => setRecordSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                                />
                            </div>
                        </div>

                        {medicalRecords.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                                <FileText className="mx-auto text-slate-400 mb-3" size={40} />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No Local Documents Stored</h3>
                                <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-4">Upload prescriptions, X-rays, or lab reports to store locally on this device.</p>
                                <button onClick={() => setIsUploadModalOpen(true)} className="bg-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-xl">Upload Document</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {medicalRecords
                                    .filter(r => r.title.toLowerCase().includes(recordSearch.toLowerCase()))
                                    .map(record => (
                                        <div key={record.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className="text-xs font-semibold bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 px-2.5 py-1 rounded-md">
                                                        {record.category || 'Prescription'}
                                                    </span>
                                                    <button onClick={() => handleDeleteRecord(record.id)} className="text-slate-400 hover:text-red-500">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{record.title}</h3>
                                                <p className="text-xs text-slate-400 mt-1">{new Date(record.uploadedAt).toLocaleDateString()}</p>
                                                {record.description && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{record.description}</p>}
                                            </div>

                                            {record.fileData && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                    <a
                                                        href={record.fileData}
                                                        download={record.fileName || "medical-document"}
                                                        className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                    >
                                                        <FileText size={14} /> Download File
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: UNIFIED HEALTH TIMELINE */}
                {activeTab === 'timeline' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Unified Patient Health Timeline</h2>
                            <p className="text-sm text-slate-500">Chronological history of doses, appointments, documents, and SOS events.</p>
                        </div>

                        {timeline.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">No health events recorded in timeline yet.</div>
                        ) : (
                            <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-6">
                                {timeline.map((event, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900"></div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                                <span className="font-semibold uppercase text-cyan-600 dark:text-cyan-400">{event.type}</span>
                                                <span>{new Date(event.timestamp).toLocaleString()}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-800 dark:text-white">{event.title}</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* MODAL: SOS Emergency Trigger */}
            {isSosModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <ShieldAlert size={32} />
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Trigger Emergency SOS Alert</h3>
                                <p className="text-xs text-slate-500">Notifies all configured emergency contacts via SMS/Voice.</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Optional Emergency Note:</label>
                            <textarea
                                value={sosNote}
                                onChange={(e) => setSosNote(e.target.value)}
                                placeholder="I need immediate emergency assistance with my medication..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm h-24"
                            />
                        </div>

                        <p className="text-[11px] text-slate-400 mb-6 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl">
                            ⚠️ DISCLAIMER: MediTrack is an emergency-contact communication tool and does NOT replace 911 or official emergency medical services.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={handleTriggerSos}
                                disabled={isSosBroadcasting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/30"
                            >
                                {isSosBroadcasting ? "Broadcasting..." : "CONFIRM BROADCAST SOS"}
                            </button>
                            <button
                                onClick={() => setIsSosModalOpen(false)}
                                className="px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Emergency Contacts Configuration */}
            {isEmergencyConfigOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Emergency Contacts Setup</h3>
                        <form onSubmit={handleSaveEmergencyContacts} className="space-y-4">
                            {emergencyContacts.map((contact, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="Contact Name"
                                            value={contact.name}
                                            onChange={(e) => {
                                                const updated = [...emergencyContacts];
                                                updated[idx].name = e.target.value;
                                                setEmergencyContacts(updated);
                                            }}
                                            className="bg-white dark:bg-slate-800 border p-2.5 rounded-xl text-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Relationship (e.g. Spouse, Caregiver)"
                                            value={contact.relationship}
                                            onChange={(e) => {
                                                const updated = [...emergencyContacts];
                                                updated[idx].relationship = e.target.value;
                                                setEmergencyContacts(updated);
                                            }}
                                            className="bg-white dark:bg-slate-800 border p-2.5 rounded-xl text-sm"
                                        />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number (+1... or 10 digits)"
                                        value={contact.phoneNumber}
                                        onChange={(e) => {
                                            const updated = [...emergencyContacts];
                                            updated[idx].phoneNumber = e.target.value;
                                            setEmergencyContacts(updated);
                                        }}
                                        className="w-full bg-white dark:bg-slate-800 border p-2.5 rounded-xl text-sm"
                                        required
                                    />
                                </div>
                            ))}

                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 rounded-xl">Save Contacts</button>
                                <button type="button" onClick={() => setIsEmergencyConfigOpen(false)} className="px-4 py-3 text-slate-500 font-semibold">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Medication 2.0 Add */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add Medication 2.0</h3>
                        <form onSubmit={handleAddMedication} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Medicine Brand Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={newMed.medicine}
                                    onChange={(e) => setNewMed({ ...newMed, medicine: e.target.value })}
                                    placeholder="e.g. Lipitor"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Generic Name</label>
                                    <input
                                        type="text"
                                        value={newMed.genericName}
                                        onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                                        placeholder="e.g. Atorvastatin"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Scheduled Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={newMed.time}
                                        onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Food Relation</label>
                                    <select
                                        value={newMed.foodRelation}
                                        onChange={(e) => setNewMed({ ...newMed, foodRelation: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                    >
                                        <option value="after_food">After Food</option>
                                        <option value="before_food">Before Food</option>
                                        <option value="with_food">With Food</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Route</label>
                                    <input
                                        type="text"
                                        value={newMed.route}
                                        onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
                                        placeholder="Oral / Injection"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl">Save Schedule</button>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-3 text-slate-500 font-semibold">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Upload Medical Document to Vault 2.0 */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Store Local Medical Document</h3>
                        <form onSubmit={handleUploadRecord} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Document Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={uploadData.title}
                                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                    placeholder="e.g. Blood Test Report June 2026"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                                <select
                                    value={uploadData.category}
                                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                >
                                    <option value="Prescription">Prescription</option>
                                    <option value="Lab Report">Lab Report</option>
                                    <option value="Scan">Scan / X-Ray</option>
                                    <option value="Medical Certificate">Medical Certificate</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Choose File *</label>
                                <input
                                    type="file"
                                    required
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setUploadData(prev => ({ ...prev, file: reader.result, fileName: file.name }));
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-cyan-500 text-white font-bold py-3 rounded-xl">Save Locally</button>
                                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-3 text-slate-500 font-semibold">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Pilot Feedback */}
            {isFeedbackOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Send Product Feedback</h3>
                        <p className="text-xs text-slate-500 mb-4">Help us refine MediTrack for pilot deployment.</p>

                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Rating (1-5 Stars)</label>
                                <select
                                    value={feedbackData.rating}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, rating: Number(e.target.value) })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                >
                                    <option value={5}>5 Stars - Excellent</option>
                                    <option value={4}>4 Stars - Good</option>
                                    <option value={3}>3 Stars - Average</option>
                                    <option value={2}>2 Stars - Needs Improvement</option>
                                    <option value={1}>1 Star - Poor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Feedback Category</label>
                                <select
                                    value={feedbackData.category}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, category: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm"
                                >
                                    <option value="experience">User Experience</option>
                                    <option value="bug">Report a Bug</option>
                                    <option value="feature">Feature Request</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Your Comments *</label>
                                <textarea
                                    required
                                    value={feedbackData.comment}
                                    onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                                    placeholder="Tell us about your experience..."
                                    className="w-full bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl text-sm h-24"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl">Submit Feedback</button>
                                <button type="button" onClick={() => setIsFeedbackOpen(false)} className="px-4 py-3 text-slate-500 font-semibold">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;