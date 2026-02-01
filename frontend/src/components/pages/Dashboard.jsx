
import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Edit2, Trash2, Clock, Repeat, Calendar, Check, TrendingUp, Sparkles, FileText, Upload, Camera } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import SpinnerLoading from "../spinnerLoading";

function Dashboard() {
    const [message, setMessage] = useState("");
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // User Profile State
    const [userProfile, setUserProfile] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        profilePic: ""
    });
    const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
    const [editProfileData, setEditProfileData] = useState({ name: "", phoneNumber: "", profilePic: "" });
    const [fileInputRef] = useState(React.createRef()); // Ref for file input

    // AI Interaction State
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [interactionResult, setInteractionResult] = useState("");
    const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);


    // Tracker Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [editMedicine, setEditMedicine] = useState("");
    const [editTime, setEditTime] = useState("");
    const [editFrequency, setEditFrequency] = useState("Daily");
    const [editSelectedDays, setEditSelectedDays] = useState([]);

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        // Load user from local storage
        const email = localStorage.getItem("userEmail");
        const name = localStorage.getItem("userName");
        const phone = localStorage.getItem("userPhone");

        if (email) {
            setUserProfile({
                name: name || "User",
                email: email,
                phoneNumber: phone || "Not set",
                profilePic: localStorage.getItem("userProfilePic") || ""
            });
            loadData(email);
        } else {
            setMessage("Please log in to see your trackers.");
        }
    }, []);

    const loadData = async (email) => {
        setIsLoading(true);
        try {
            await Promise.all([fetchCards(email), fetchLogs(email), fetchStreak(email)]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCards = async (email) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-tracker?email=${email}`);
            const data = await res.json();
            if (res.ok) {
                setCards(data.data);
            } else {
                setCards([]);
            }
        } catch (error) {
            console.error("Error fetching cards:", error);
            setMessage("Failed to fetch trackers.");
        }
    };

    const fetchLogs = async (email) => {
        const today = new Date().toISOString().split('T')[0];
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-logs?email=${email}&date=${today}`);
            const data = await res.json();
            if (res.ok) {
                setLogs(data.data);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        }
    };

    const fetchStreak = async (email) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/get-streak?email=${email}`);
            const data = await res.json();
            if (res.ok) {
                setStreak(data.streak);
            }
        } catch (error) {
            console.error("Error fetching streak:", error);
        }
    };

    // Calculate progress whenever cards or logs change
    useEffect(() => {
        if (cards.length > 0) {
            const takenCount = logs.length;
            const totalCount = cards.length;
            // Cap at 100% just in case of duplicate logs
            const percentage = Math.min(Math.round((takenCount / totalCount) * 100), 100);
            setProgress(percentage);
        } else {
            setProgress(0);
        }
    }, [cards, logs]);

    const handleMarkTaken = async (card) => {
        const { medicine, startDate, endDate, id } = card;

        // Fix: Use local date to match what user selects in the form
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        console.log("Checking deletion:", { medicine, startDate, endDate, today, id });

        // Optimistic UI update check
        if (logs.some(log => log.medicine === medicine)) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/log-medication`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userProfile.email,
                    medicine: medicine,
                    date: today,
                    status: 'taken'
                }),
            });

            if (res.ok) {
                // Update local state
                setLogs(prev => [...prev, { medicine: medicine, date: today, status: 'taken' }]);

                // 🗑️ INSTANT DELETION CHECK
                // If the tracker is ONLY for today (Start=Today AND End=Today)
                if (startDate === today && endDate === today) {
                    console.log("Deleting tracker instantly...");
                    await handleDelete(id, true); // Pass 'true' to suppress confirmation
                } else {
                    setMessage(`Marked ${medicine} as taken!`);
                    setTimeout(() => setMessage(""), 3000);
                }

                // Refresh streak
                fetchStreak(userProfile.email);
            }
        } catch (error) {
            console.error("Error logging medication:", error);
            setMessage("Failed to log medication.");
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100000) { // Limit to ~100KB to preserve DB space
                alert("Image too large. Please choose an image under 100KB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditProfileData(prev => ({ ...prev, profilePic: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // --- AI & Report Functions ---
    const handleAnalyzeInteractions = async () => {
        if (cards.length < 2) {
            alert("Add at least two medicines to check for interactions.");
            return;
        }

        setIsAnalysisLoading(true);
        const medicines = cards.map(c => c.medicine).join(", ");
        const prompt = `Analyze specific drug interactions between these medicines: ${medicines}. Warning: Focus ONLY on significant interactions. Be concise.`;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: prompt }),
            });
            const data = await res.json();
            setInteractionResult(data.reply);
            setIsInteractionModalOpen(true);
        } catch (error) {
            console.error("Error analyzing:", error);
            alert("Failed to analyze interactions.");
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(6, 182, 212); // Cyan color
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("MediTrack Health Report", 105, 13, null, null, "center");

        // User Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Name: ${userProfile.name}`, 14, 30);
        doc.text(`Email: ${userProfile.email}`, 14, 36);
        doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 42);

        // Trackers Table
        doc.setFontSize(14);
        doc.setTextColor(6, 182, 212);
        doc.text("Current Medications", 14, 55);

        const trackerRows = cards.map(c => [c.medicine, c.time, c.frequency]);
        doc.autoTable({
            startY: 60,
            head: [['Medicine', 'Time', 'Frequency']],
            body: trackerRows,
            theme: 'grid',
            headStyles: { fillColor: [6, 182, 212] },
            margin: { left: 14, right: 14 }
        });

        // Logs Table
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.text("Recent Activity", 14, finalY);

        const logRows = logs.slice(0, 15).map(l => [l.medicine, l.date, 'Taken']); // Show last 15 logs
        doc.autoTable({
            startY: finalY + 5,
            head: [['Medicine', 'Date', 'Status']],
            body: logRows,
            theme: 'striped',
            headStyles: { fillColor: [75, 85, 99] },
            margin: { left: 14, right: 14 }
        });

        doc.save("meditrack-report.pdf");
    };

    // --- Profile Functions ---
    const handleProfileEditClick = () => {
        setEditProfileData({
            name: userProfile.name,
            phoneNumber: userProfile.phoneNumber === "Not set" ? "" : userProfile.phoneNumber,
            profilePic: userProfile.profilePic
        });
        setIsProfileEditOpen(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/update-profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userProfile.email,
                    name: editProfileData.name,
                    phoneNumber: editProfileData.phoneNumber,
                    profilePic: editProfileData.profilePic
                }),
            });
            const data = await res.json();
            if (res.ok) {
                // Update local state and storage
                setUserProfile(prev => ({
                    ...prev,
                    name: data.user.name,
                    phoneNumber: data.user.phoneNumber,
                    profilePic: data.user.profilePic
                }));
                localStorage.setItem("userName", data.user.name);
                localStorage.setItem("userPhone", data.user.phoneNumber);
                localStorage.setItem("userProfilePic", data.user.profilePic || "");

                setIsProfileEditOpen(false);
                setMessage("Profile updated successfully!");
                setTimeout(() => setMessage(""), 3000);
            } else {
                alert(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        }
    };


    // --- Tracker Functions ---
    const handleDelete = async (id, skipConfirm = false) => {
        if (!skipConfirm && !window.confirm("Are you sure you want to delete this tracker?")) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/delete-tracker/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (!res.ok) {
                setMessage(data.message || "Something went wrong");
                return;
            }
            setCards(currentCards => currentCards.filter(card => card.id !== id));
            setMessage("Tracker deleted successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage("Failed to delete tracker");
        }
    };

    const openEditModal = (card) => {
        setEditingCard(card);
        setEditMedicine(card.medicine);
        setEditTime(card.time);
        setEditFrequency(card.frequency || "Daily");
        setEditSelectedDays(card.selectedDays || []);
        setIsEditModalOpen(true);
    };

    const handleEditDayChange = (day) => {
        if (editSelectedDays.includes(day)) {
            setEditSelectedDays(editSelectedDays.filter(d => d !== day));
        } else {
            setEditSelectedDays([...editSelectedDays, day]);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (editFrequency === "Specific Days" && editSelectedDays.length === 0) {
            alert("Please select at least one day.");
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/update-tracker/${editingCard.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    medicine: editMedicine,
                    time: editTime,
                    frequency: editFrequency,
                    selectedDays: editSelectedDays
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.message || "Update failed");
                return;
            }
            setCards(cards.map(card =>
                card.id === editingCard.id
                    ? { ...card, medicine: editMedicine, time: editTime, frequency: editFrequency, selectedDays: editSelectedDays }
                    : card
            ));
            setIsEditModalOpen(false);
            setMessage("Tracker updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            alert("Failed to update tracker");
        }
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen p-6 w-full max-w-7xl mx-auto">
            {/* Same content as before, just ensuring we return the main div */}
            {/* ALERT MESSAGE */}
            {message && (
                <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-xl font-semibold backdrop-blur-md border ${message.includes("Failed") || message.includes("Error") ? "bg-red-500/20 text-red-600 border-red-200" : "bg-green-500/20 text-green-600 border-green-200"}`}>
                    {message}
                </div>
            )}

            {/* HEADER */}
            <h1 className="text-4xl font-extrabold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                Patient Dashboard
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* PROFILE SECTION */}
                <div className="lg:col-span-1">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl sticky top-24">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Profile</h2>
                            <button onClick={handleProfileEditClick} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-cyan-600 transition-colors">
                                <Edit2 size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4 overflow-hidden border-4 border-white dark:border-slate-800">
                                {userProfile.profilePic ? (
                                    <img src={userProfile.profilePic} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    userProfile.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{userProfile.name}</h3>
                            <p className="text-slate-500 text-sm">Patient</p>

                            <button
                                onClick={handleDownloadReport}
                                className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FileText size={16} />
                                Health Report
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <Mail className="text-cyan-500" size={20} />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{userProfile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <Phone className="text-blue-500" size={20} />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{userProfile.phoneNumber}</p>
                                </div>
                            </div>

                            {/* 🔥 STREAK DISPLAY */}
                            <div className="flex items-center space-x-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
                                <TrendingUp className="text-orange-500" size={20} />
                                <div>
                                    <p className="text-xs text-orange-600/80 dark:text-orange-400 uppercase font-bold">Current Streak</p>
                                    <p className="text-lg font-black text-orange-600 dark:text-orange-400">{streak} Days</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TRACKERS SECTION */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock className="text-cyan-500" />
                            Active Reminders
                        </h2>
                        <button
                            onClick={handleAnalyzeInteractions}
                            disabled={isAnalysisLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors disabled:opacity-50"
                        >
                            {isAnalysisLoading ? (
                                <span className="animate-spin">✨</span>
                            ) : (
                                <Sparkles size={18} />
                            )}
                            Check Interactions
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {cards.length > 0 ? (
                            cards.map((card) => (
                                <div key={card.id} className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEditModal(card)} className="p-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(card.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="mb-4 flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{card.medicine}</h3>
                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                                Active
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleMarkTaken(card)}
                                            disabled={logs.some(log => log.medicine === card.medicine)}
                                            className={`p-3 rounded-xl transition-all shadow-sm ${logs.some(log => log.medicine === card.medicine)
                                                ? "bg-green-500 text-white cursor-default"
                                                : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-green-500 hover:text-white"
                                                }`}
                                            title="Mark as Taken"
                                        >
                                            <Check size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                                            <Clock size={16} className="mr-2" />
                                            <span>{card.time}</span>
                                        </div>
                                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                                            <Repeat size={16} className="mr-2" />
                                            <span>{card.frequency}</span>
                                        </div>
                                        {card.frequency === "Specific Days" && (
                                            <div className="flex items-start text-slate-600 dark:text-slate-300">
                                                <Calendar size={16} className="mr-2 mt-1" />
                                                <span className="text-sm">{card.selectedDays?.join(", ")}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                <p className="text-slate-500">No active reminders found.</p>
                                <p className="text-sm text-slate-400 mt-1">Go to the Tracker page to add one!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PROFILE EDIT MODAL */}
            {isProfileEditOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Edit Profile</h2>
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4 relative group">
                                {editProfileData.profilePic ? (
                                    <img src={editProfileData.profilePic} alt="Profile Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <User size={32} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                    <Camera className="text-white" size={24} />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <div className="flex gap-4 mt-2">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="text-sm text-cyan-600 font-medium hover:text-cyan-700">Change Photo</button>
                                {editProfileData.profilePic && (
                                    <button type="button" onClick={() => setEditProfileData({ ...editProfileData, profilePic: "" })} className="text-sm text-red-500 font-medium hover:text-red-700">Remove Photo</button>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editProfileData.name}
                                    onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={editProfileData.phoneNumber}
                                    onChange={(e) => setEditProfileData({ ...editProfileData, phoneNumber: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsProfileEditOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-black text-white rounded-xl hover:opacity-90">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* INTERACTION ANALYSIS MODAL */}
            {isInteractionModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                            <Sparkles className="text-purple-600" size={24} />
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Interaction Analysis</h2>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mb-4 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {interactionResult || "No significant interactions found."}
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setIsInteractionModalOpen(false)}
                                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Edit Reminder</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Medicine Name</label>
                                <input
                                    type="text"
                                    value={editMedicine}
                                    onChange={(e) => setEditMedicine(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={editTime}
                                    onChange={(e) => setEditTime(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Frequency</label>
                                <select
                                    value={editFrequency}
                                    onChange={(e) => setEditFrequency(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Specific Days">Specific Days</option>
                                </select>
                            </div>

                            {editFrequency === "Specific Days" && (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <p className="text-sm font-semibold mb-2">Select Days:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {daysOfWeek.map(day => (
                                            <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editSelectedDays.includes(day)}
                                                    onChange={() => handleEditDayChange(day)}
                                                    className="rounded text-cyan-600 focus:ring-cyan-500"
                                                />
                                                <span className="text-sm">{day.slice(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;

function DashboardSkeleton() {
    return (
        <div className="min-h-screen p-6 w-full max-w-7xl mx-auto animate-pulse">
            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-10"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Skeleton */}
                <div className="lg:col-span-1">
                    <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 h-[400px]">
                        <div className="w-24 h-24 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-4"></div>
                        <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded mx-auto mb-2"></div>
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mx-auto mb-8"></div>

                        <div className="space-y-4">
                            <div className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                            <div className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        </div>
                    </div>
                </div>

                {/* Tracker Skeleton */}
                <div className="lg:col-span-2">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-40 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}